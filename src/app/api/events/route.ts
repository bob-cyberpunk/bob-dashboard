import { readFile, stat } from "fs/promises";
import path from "path";

const STATE_PATH =
  process.env.WORKFLOW_STATE_PATH ||
  path.join(process.cwd(), "..", "memory", "workflow-state.json");

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
        send("init", JSON.parse(raw));
      } catch {
        send("init", { tasks: [], lastUpdated: null });
      }

      let lastMtime = 0;
      try {
        lastMtime = (await stat(STATE_PATH)).mtimeMs;
      } catch {
        /* ignore */
      }

      // Poll for changes every 2s
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        try {
          const s = await stat(STATE_PATH);
          if (s.mtimeMs !== lastMtime) {
            lastMtime = s.mtimeMs;
            const raw = await readFile(STATE_PATH, "utf-8");
            send("update", JSON.parse(raw));
          }
        } catch {
          /* file may not exist yet */
        }
      }, 2000);

      // Heartbeat every 30s to keep connection alive
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
