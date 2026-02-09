export type TaskStatus =
  | "inbox"
  | "in_progress"
  | "delegated"
  | "review"
  | "done";
export type Priority = "high" | "medium" | "low";
export type Source = "slack" | "heartbeat" | "cron" | "self";
export type SubagentStatus = "running" | "completed" | "failed";

export interface SubagentInfo {
  sessionKey: string;
  model: string;
  status: SubagentStatus;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  priority: Priority;
  source: Source;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  subagentInfo: SubagentInfo | null;
  tags: string[];
}

export interface WorkflowState {
  tasks: Task[];
  lastUpdated: string;
}

export const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "in_progress", label: "In Progress" },
  { key: "delegated", label: "Delegated" },
  { key: "review", label: "In Review" },
  { key: "done", label: "Done" },
];
