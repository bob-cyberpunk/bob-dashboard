import { execSync } from "node:child_process";
import { join } from "node:path";
import { readJSON, writeJSON, type Task, type WorkflowState } from "./state.js";

const LN = join(__dirname, "..", "..", "..", "bin", "ln");
const CRE_TEAM = "7320c4aa-f7c7-41c9-9496-c54127a402ed";
const ENG_TEAM = "9ea9dadc-eb70-4647-854d-2b413d82068a";

function mapStatus(state: string): Task["status"] {
  const s = state.toLowerCase();
  if (["backlog", "triage"].includes(s)) return "inbox";
  if (["unstarted"].includes(s)) return "scheduled";
  if (["todo"].includes(s)) return "todo";
  if (["started", "in progress"].includes(s)) return "in_progress";
  if (["in review"].includes(s)) return "review";
  if (["done", "completed", "cancelled", "canceled"].includes(s)) return "done";
  return "inbox";
}

function runLn(args: string): unknown {
  try {
    const out = execSync(`${LN} ${args}`, {
      encoding: "utf-8",
      timeout: 30000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return JSON.parse(out);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`Linear CLI error: ${msg}`);
    return null;
  }
}

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority?: number;
  state?: { name: string };
  labels?: { nodes?: Array<{ name: string }> };
  assignee?: { name: string };
}

function priorityMap(p?: number): Task["priority"] {
  if (p === 1) return "urgent";
  if (p === 2) return "high";
  if (p === 3) return "medium";
  return "low";
}

export async function syncLinear(): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  const allIssues: LinearIssue[] = [];

  for (const teamId of [CRE_TEAM, ENG_TEAM]) {
    const result = runLn(`list_issues team_id=${teamId} first=50`) as { issues?: { nodes?: LinearIssue[] } } | null;
    if (result && Array.isArray((result as any)?.issues?.nodes)) {
      allIssues.push(...(result as any).issues.nodes);
    } else if (result && Array.isArray((result as any)?.nodes)) {
      allIssues.push(...(result as any).nodes);
    } else {
      errors.push(`Failed to fetch issues for team ${teamId}`);
    }
  }

  const state = readJSON<WorkflowState>("workflow-state.json", { tasks: [], lastUpdated: new Date().toISOString() });
  const taskMap = new Map(state.tasks.map((t) => [t.id, t]));
  let synced = 0;

  for (const issue of allIssues) {
    const id = issue.identifier;
    const existing = taskMap.get(id);
    const status = mapStatus(issue.state?.name ?? "backlog");
    const tags = issue.labels?.nodes?.map((l) => l.name) ?? [];

    if (existing) {
      // Update but preserve dashboard-only fields
      existing.title = issue.title;
      existing.description = issue.description ?? existing.description;
      existing.status = status;
      existing.priority = priorityMap(issue.priority);
      existing.linearId = issue.id;
      existing.tags = tags.length > 0 ? tags : existing.tags;
      existing.updatedAt = new Date().toISOString();
      if (status === "done" && !existing.completedAt) {
        existing.completedAt = new Date().toISOString();
      }
    } else {
      const task: Task = {
        id,
        title: issue.title,
        description: issue.description,
        status,
        priority: priorityMap(issue.priority),
        assignee: issue.assignee?.name,
        source: "linear",
        tags,
        linearId: issue.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: status === "done" ? new Date().toISOString() : null,
      };
      taskMap.set(id, task);
    }
    synced++;
  }

  state.tasks = Array.from(taskMap.values());
  state.lastUpdated = new Date().toISOString();
  writeJSON("workflow-state.json", state);

  return { synced, errors };
}

// Run standalone
if (require.main === module) {
  syncLinear().then((r) => {
    console.log(`Synced ${r.synced} issues`);
    if (r.errors.length) console.error("Errors:", r.errors);
  });
}
