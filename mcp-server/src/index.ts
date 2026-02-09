#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { readJSON, writeJSON, type Task, type WorkflowState, type ActivityLog, type ActivityEntry } from "./state.js";
import { syncLinear } from "./linear-sync.js";

const server = new McpServer({ name: "bob-dashboard", version: "1.0.0" });

// ── Helpers ──

function now() { return new Date().toISOString(); }
function genId() { return `task-${randomUUID().slice(0, 8)}`; }

function getTasks(): WorkflowState {
  return readJSON<WorkflowState>("workflow-state.json", { tasks: [], lastUpdated: now() });
}
function saveTasks(s: WorkflowState) {
  s.lastUpdated = now();
  writeJSON("workflow-state.json", s);
}

function getActivity(): ActivityLog {
  return readJSON<ActivityLog>("activity-log.json", { log: [] });
}
function appendActivity(entry: Omit<ActivityEntry, "id" | "timestamp">) {
  const log = getActivity();
  log.log.unshift({ ...entry, id: randomUUID().slice(0, 8), timestamp: now() });
  if (log.log.length > 100) log.log.length = 100;
  writeJSON("activity-log.json", log);
}

const statusEnum = z.enum(["inbox", "in_progress", "review", "done"]);
const priorityEnum = z.enum(["low", "medium", "high", "urgent"]);

// ── Tools ──

server.tool("dashboard_list_tasks",
  { status: z.string().optional() },
  async ({ status }) => {
    const s = getTasks();
    const tasks = status ? s.tasks.filter(t => t.status === status) : s.tasks;
    return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
  }
);

server.tool("dashboard_create_task",
  {
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    assignee: z.string().optional(),
  },
  async (input) => {
    const s = getTasks();
    const task: Task = {
      id: input.id || genId(),
      title: input.title,
      description: input.description,
      status: input.status ?? "inbox",
      priority: input.priority ?? "medium",
      source: input.source,
      tags: input.tags,
      assignee: input.assignee,
      createdAt: now(),
      updatedAt: now(),
      completedAt: null,
    };
    s.tasks.push(task);
    saveTasks(s);
    appendActivity({ type: "task_created", message: `Created task: ${task.title}`, source: "dashboard" });
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  }
);

server.tool("dashboard_update_task",
  {
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    assignee: z.string().optional(),
    tags: z.array(z.string()).optional(),
  },
  async (input) => {
    const s = getTasks();
    const task = s.tasks.find(t => t.id === input.id);
    if (!task) return { content: [{ type: "text", text: `Task ${input.id} not found` }] };
    const { id, ...updates } = input;
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) (task as any)[k] = v;
    }
    task.updatedAt = now();
    if (input.status === "done" && !task.completedAt) task.completedAt = now();
    saveTasks(s);
    appendActivity({ type: "task_updated", message: `Updated task: ${task.title}`, source: "dashboard" });
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  }
);

server.tool("dashboard_delete_task",
  { id: z.string() },
  async ({ id }) => {
    const s = getTasks();
    const idx = s.tasks.findIndex(t => t.id === id);
    if (idx === -1) return { content: [{ type: "text", text: `Task ${id} not found` }] };
    const [removed] = s.tasks.splice(idx, 1);
    saveTasks(s);
    appendActivity({ type: "task_deleted", message: `Deleted task: ${removed.title}`, source: "dashboard" });
    return { content: [{ type: "text", text: `Deleted ${id}` }] };
  }
);

server.tool("dashboard_move_task",
  { id: z.string(), status: statusEnum },
  async ({ id, status }) => {
    const s = getTasks();
    const task = s.tasks.find(t => t.id === id);
    if (!task) return { content: [{ type: "text", text: `Task ${id} not found` }] };
    const old = task.status;
    task.status = status;
    task.updatedAt = now();
    if (status === "done" && !task.completedAt) task.completedAt = now();
    saveTasks(s);
    appendActivity({ type: "task_moved", message: `Moved ${task.title}: ${old} → ${status}`, source: "dashboard" });
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  }
);

server.tool("dashboard_log_activity",
  {
    type: z.string(),
    message: z.string(),
    source: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  },
  async (input) => {
    appendActivity(input);
    return { content: [{ type: "text", text: "Activity logged" }] };
  }
);

server.tool("dashboard_update_threads",
  { threads: z.unknown() },
  async ({ threads }) => {
    writeJSON("threads-state.json", threads);
    return { content: [{ type: "text", text: "Threads state updated" }] };
  }
);

server.tool("dashboard_update_subagents",
  { subagents: z.unknown() },
  async ({ subagents }) => {
    writeJSON("subagents-state.json", subagents);
    return { content: [{ type: "text", text: "Subagents state updated" }] };
  }
);

server.tool("dashboard_sync_linear", {}, async () => {
  const result = await syncLinear();
  appendActivity({ type: "linear_sync", message: `Synced ${result.synced} issues from Linear`, source: "linear" });
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("dashboard_mark_conversation_complete",
  { conversationId: z.string() },
  async ({ conversationId }) => {
    const fb = readJSON<{ conversations: Array<{ id: string; status: string; completedAt?: string }> }>(
      "featurebase-state.json", { conversations: [] }
    );
    const conv = fb.conversations?.find((c: any) => c.id === conversationId);
    if (conv) {
      conv.status = "completed";
      conv.completedAt = now();
      writeJSON("featurebase-state.json", fb);
      appendActivity({ type: "conversation_completed", message: `Marked conversation ${conversationId} complete`, source: "featurebase" });
      return { content: [{ type: "text", text: `Conversation ${conversationId} marked complete` }] };
    }
    return { content: [{ type: "text", text: `Conversation ${conversationId} not found` }] };
  }
);

// ── Resources ──

server.resource("tasks", "dashboard://tasks", async () => ({
  contents: [{ uri: "dashboard://tasks", mimeType: "application/json", text: JSON.stringify(getTasks(), null, 2) }],
}));

server.resource("activity", "dashboard://activity", async () => ({
  contents: [{ uri: "dashboard://activity", mimeType: "application/json", text: JSON.stringify(getActivity(), null, 2) }],
}));

server.resource("monitor", "dashboard://monitor", async () => {
  const data = {
    threads: readJSON("threads-state.json", {}),
    subagents: readJSON("subagents-state.json", {}),
    prWatch: readJSON("pr-watch-state.json", {}),
    support: readJSON("featurebase-state.json", {}),
  };
  return {
    contents: [{ uri: "dashboard://monitor", mimeType: "application/json", text: JSON.stringify(data, null, 2) }],
  };
});

// ── Start ──

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch(console.error);
