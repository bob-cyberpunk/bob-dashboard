"use client";

import type { Task } from "@/lib/types";

const priorityColor: Record<string, string> = {
  high: "text-red-400 bg-red-500/20 border-red-500/30",
  medium: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  low: "text-white/50 bg-white/10 border-white/10",
};

const statusColor: Record<string, string> = {
  running: "text-cyan-400",
  completed: "text-green-400",
  failed: "text-red-400",
};

export function TaskDetail({ task }: { task: Task }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white/90">{task.title}</h2>

      <div className="flex flex-wrap gap-1.5">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/40">
          {task.status.replace("_", " ")}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/40">
          {task.source}
        </span>
      </div>

      <Section label="Description">
        <p className="text-[11px] text-white/60 whitespace-pre-wrap leading-relaxed">
          {task.description || "No description"}
        </p>
      </Section>

      <Section label="Tags">
        <div className="flex flex-wrap gap-1">
          {task.tags.length === 0 && <span className="text-[11px] text-white/20 font-mono">none</span>}
          {task.tags.map((t) => (
            <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {t}
            </span>
          ))}
        </div>
      </Section>

      <Section label="Assignee">
        <span className="text-[11px] font-mono text-cyan-300">{task.assignee}</span>
      </Section>

      {task.subagentInfo && (
        <Section label="Subagent">
          <div className="space-y-1 text-[11px] font-mono">
            <Row label="session" value={task.subagentInfo.sessionKey} />
            <Row label="model" value={task.subagentInfo.model} valueClass="text-cyan-400" />
            <Row label="status">
              <span className={statusColor[task.subagentInfo.status]}>
                {task.subagentInfo.status}
                {task.subagentInfo.status === "running" && <span className="animate-pulse"> ●</span>}
              </span>
            </Row>
          </div>
        </Section>
      )}

      <Section label="Timestamps">
        <div className="space-y-1 text-[11px] font-mono">
          <Row label="created" value={new Date(task.createdAt).toLocaleString()} />
          <Row label="updated" value={new Date(task.updatedAt).toLocaleString()} />
          {task.completedAt && <Row label="completed" value={new Date(task.completedAt).toLocaleString()} />}
        </div>
      </Section>

      <Section label="ID">
        <span className="text-[10px] font-mono text-white/20 break-all">{task.id}</span>
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-white/25 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Row({ label, value, valueClass, children }: { label: string; value?: string; valueClass?: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-white/25 shrink-0">{label}:</span>
      {children || <span className={`text-white/50 break-all ${valueClass || ""}`}>{value}</span>}
    </div>
  );
}
