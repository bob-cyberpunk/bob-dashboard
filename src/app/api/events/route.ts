import { readFile, stat } from "fs/promises";
import path from "path";

const MEMORY_DIR = path.join(process.cwd(), "..", "memory");
const STATE_PATH =
  process.env.WORKFLOW_STATE_PATH ||
  path.join(MEMORY_DIR, "workflow-state.json");

const MONITOR_FILES = {
  threads: path.join(MEMORY_DIR, "threads-state.json"),
  subagents: path.join(MEMORY_DIR, "subagents-state.json"),
  prWatch: path.join(MEMORY_DIR, "pr-watch-state.json"),
  prState: path.join(MEMORY_DIR, "pr-state.json"),
  featurebase: path.join(MEMORY_DIR, "featurebase-state.json"),
  activityLog: path.join(MEMORY_DIR, "activity-log.json"),
};

async function readJsonSafe(filepath: string, fallback: unknown) {
  try {
    return JSON.parse(await readFile(filepath, "utf-8"));
  } catch {
    return fallback;
  }
}

async function getMtimeSafe(filepath: string): Promise<number> {
  try {
    return (await stat(filepath)).mtimeMs;
  } catch {
    return 0;
  }
}

async function readMonitorData() {
  const [threads, subagents, prWatch, prState, featurebase, activityLog] =
    await Promise.all([
      readJsonSafe(MONITOR_FILES.threads, { threads: [] }),
      readJsonSafe(MONITOR_FILES.subagents, { sessions: [] }),
      readJsonSafe(MONITOR_FILES.prWatch, {}),
      readJsonSafe(MONITOR_FILES.prState, { knownPRs: [] }),
      readJsonSafe(MONITOR_FILES.featurebase, {}),
      readJsonSafe(MONITOR_FILES.activityLog, { log: [] }),
    ]);
  return { threads, subagents, prWatch, prState, featurebase, activityLog };
}

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      // Send initial state
      try {
        const raw = await readFile(STATE_PATH, "utf-8");
        const monitor = await readMonitorData();
        send("init", { ...JSON.parse(raw), monitor });
      } catch {
        const monitor = await readMonitorData();
        send("init", { tasks: [], lastUpdated: null, monitor });
      }

      // Track mtimes for all files
      let lastMtime = await getMtimeSafe(STATE_PATH);
      const lastMonitorMtimes: Record<string, number> = {};
      for (const [key, filepath] of Object.entries(MONITOR_FILES)) {
        lastMonitorMtimes[key] = await getMtimeSafe(filepath);
      }

      // Poll for changes every 2s
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        try {
          // Check workflow state
          const wfMtime = await getMtimeSafe(STATE_PATH);
          let workflowChanged = false;
          if (wfMtime !== lastMtime) {
            lastMtime = wfMtime;
            workflowChanged = true;
          }

          // Check monitor files
          let monitorChanged = false;
          for (const [key, filepath] of Object.entries(MONITOR_FILES)) {
            const mt = await getMtimeSafe(filepath);
            if (mt !== lastMonitorMtimes[key]) {
              lastMonitorMtimes[key] = mt;
              monitorChanged = true;
            }
          }

          if (workflowChanged || monitorChanged) {
            const raw = await readJsonSafe(STATE_PATH, { tasks: [], lastUpdated: null });
            const monitor = await readMonitorData();
            send("update", { ...raw, monitor });
          }
        } catch {
          /* ignore */
        }
      }, 2000);

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat);
          return;
        }
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          closed = true;
          clearInterval(heartbeat);
          clearInterval(interval);
        }
      }, 30000);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
