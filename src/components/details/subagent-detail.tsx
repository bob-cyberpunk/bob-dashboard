"use client";

import type { SubagentSession } from "@/lib/types";

const statusStyles: Record<string, string> = {
  running: "text-cyan-400",
  completed: "text-green-400",
  failed: "text-red-400",
};

function duration(startedAt: string, completedAt: string | null): string {
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const ms = end - new Date(startedAt).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function SubagentDetail({ session }: { session: SubagentSession }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {session.status === "running" && (
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        )}
        <span className={`text-xs font-mono font-semibold ${statusStyles[session.status]}`}>
          {session.status}
        </span>
        <span className="text-[10px] font-mono text-white/20 ml-auto">
          {duration(session.startedAt, session.completedAt)}
        </span>
      </div>

      <Section label="Task">
        <p className="text-[11px] text-white/60 whitespace-pre-wrap leading-relaxed">
          {session.task}
        </p>
      </Section>

      <Section label="Model">
        <span className="text-[11px] font-mono text-purple-300">{session.model}</span>
      </Section>

      <Section label="Session Key">
        <span className="text-[10px] font-mono text-white/30 break-all bg-white/[0.03] rounded p-2 border border-white/5 block">
          {session.sessionKey}
        </span>
      </Section>

      <Section label="Timestamps">
        <div className="space-y-1 text-[11px] font-mono">
          <div className="flex gap-2">
            <span className="text-white/25 shrink-0">started:</span>
            <span className="text-white/50">{new Date(session.startedAt).toLocaleString()}</span>
          </div>
          {session.completedAt && (
            <div className="flex gap-2">
              <span className="text-white/25 shrink-0">completed:</span>
              <span className="text-white/50">{new Date(session.completedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
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
