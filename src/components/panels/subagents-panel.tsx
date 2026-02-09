"use client";

import type { SubagentsState, SubagentSession } from "@/lib/types";

function duration(startedAt: string, completedAt: string | null): string {
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const ms = end - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const statusStyles: Record<string, string> = {
  running: "text-cyan-400",
  completed: "text-green-400",
  failed: "text-red-400",
};

export function SubagentsPanel({ data, onSelect }: { data: SubagentsState; onSelect?: (s: SubagentSession) => void }) {
  const running = data.sessions.filter((s) => s.status === "running").length;
  return (
    <div className="flex flex-col h-full bg-[#0d0d14] rounded-lg border border-purple-500/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-purple-500/10 flex items-center gap-2">
        <div className="w-1 h-4 bg-purple-500 rounded-full" />
        <span className="text-[11px] font-mono font-semibold text-purple-400 uppercase tracking-wider">
          Subagents
        </span>
        <span className="ml-auto text-[10px] font-mono text-white/30">
          {running > 0 && (
            <span className="text-cyan-400">{running} running · </span>
          )}
          {data.sessions.length} total
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {data.sessions.length === 0 && (
          <div className="text-[11px] font-mono text-white/20 text-center py-4">
            no sessions
          </div>
        )}
        {data.sessions.map((s) => (
          <div
            key={s.sessionKey}
            onClick={() => onSelect?.(s)}
            className="bg-white/[0.03] rounded px-2.5 py-1.5 border border-white/5 hover:border-purple-500/20 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              {s.status === "running" && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
              <span className={`text-[11px] font-mono ${statusStyles[s.status]}`}>
                {s.status}
              </span>
              <span className="text-[10px] font-mono text-white/20 ml-auto">
                {duration(s.startedAt, s.completedAt)}
              </span>
            </div>
            <div className="text-[11px] text-white/60 truncate mt-0.5">
              {s.task}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 mt-0.5">
              <span className="text-purple-300/50">{s.model}</span>
              <span className="truncate">{s.sessionKey.slice(0, 20)}…</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
