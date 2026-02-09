export type TaskStatus =
  | "inbox"
  | "scheduled"
  | "todo"
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

// Monitor types
export interface ThreadInfo {
  id: string;
  channel: string;
  topic: string;
  lastMessage: string;
  participants: string[];
  lastActivity: string;
  status: "active" | "waiting" | "resolved";
}

export interface ThreadsState {
  threads: ThreadInfo[];
}

export interface SubagentSession {
  sessionKey: string;
  task: string;
  model: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt: string | null;
}

export interface SubagentsState {
  sessions: SubagentSession[];
}

export interface PRWatchState {
  knownBugbotComments: Record<string, number[]>;
  lastCIStatus: Record<string, string>;
  addressedComments: string[];
  inProgressBySubagent: Record<string, string>;
  overnightFixes: string[];
  lastChecked: string;
}

export interface PRState {
  knownPRs: number[];
  lastCheckTs: number;
}

export interface FeaturebaseState {
  lastConversationId: string;
  knownConversationIds: string[];
  knownPostIds: string[];
  lastSupportCheckTs: number;
  completedConversationIds?: string[];
}

export interface ActivityEntry {
  timestamp: string;
  action: string;
  detail: string;
  source: "heartbeat" | "slack" | "cron" | "manual";
}

export interface ActivityLogState {
  log: ActivityEntry[];
}

export interface MonitorData {
  threads: ThreadsState;
  subagents: SubagentsState;
  prWatch: PRWatchState;
  prState: PRState;
  featurebase: FeaturebaseState;
  activityLog: ActivityLogState;
}

export const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "scheduled", label: "Scheduled" },
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "delegated", label: "Delegated" },
  { key: "review", label: "In Review" },
  { key: "done", label: "Done" },
];
