import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MEMORY_DIR = join(__dirname, "..", "..", "..", "memory");

export function statePath(name: string): string {
  return join(MEMORY_DIR, name);
}

export function readJSON<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(statePath(name), "utf-8"));
  } catch {
    return fallback;
  }
}

export function writeJSON(name: string, data: unknown): void {
  writeFileSync(statePath(name), JSON.stringify(data, null, 2) + "\n");
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "inbox" | "scheduled" | "todo" | "in_progress" | "delegated" | "review" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  source?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  linearId?: string;
  subagentInfo?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WorkflowState {
  tasks: Task[];
  lastUpdated: string;
}

export interface ActivityEntry {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityLog {
  log: ActivityEntry[];
}
