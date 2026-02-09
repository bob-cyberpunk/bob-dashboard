"use client";

import type { ThreadsState } from "@/lib/types";

function timeAgo(ts: string): string {
  const ms = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const statusDot: Record<string, string> = {
  active: "bg-blue-400 animate-pulse",
  waiting: "bg-yellow-400",
  resolved: "bg-green-400",
};

export function ThreadsPanel({ data }: { data: ThreadsState }) {
  return (
    <div className="flex flex-col h-full bg-[#0d0d14] rounded-lg border border-blue-500/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-blue-500/10 flex items-center gap-2">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <span className="text-[11px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
          Active Threads
        </span>
        <span className="ml-auto text-[10px] font-mono text-white/30">
          {data.threads.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {data.threads.length === 0 && (
          <div className="text-[11px] font-mono text-white/20 text-center py-4">
            no active threads
          </div>
        )}
        {data.threads.map((t) => (
          <div
            key={t.id}
            className="bg-white/[0.03] rounded px-2.5 py-1.5 border border-white/5 hover:border-blue-500/20 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[t.status] || "bg-white/30"}`} />
              <span className="text-[11px] font-mono text-blue-300 truncate">
                #{t.channel}
              </span>
              <span className="ml-auto text-[10px] font-mono text-white/20">
                {timeAgo(t.lastActivity)}
              </span>
            </div>
            <div className="text-[11px] text-white/60 truncate mt-0.5">
              {t.topic || t.lastMessage}
            </div>
            <div className="text-[10px] font-mono text-white/20 mt-0.5">
              {t.participants.slice(0, 3).join(", ")}
              {t.participants.length > 3 && ` +${t.participants.length - 3}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
