"use client";

import type { ActivityLogState, ActivityEntry } from "@/lib/types";

const sourceBadge: Record<string, string> = {
  heartbeat: "bg-green-500/20 text-green-400 border-green-500/30",
  slack: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cron: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manual: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function ActivityPanel({ data, onSelect }: { data: ActivityLogState; onSelect?: (e: ActivityEntry) => void }) {
  const entries = (data.log || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 20);

  return (
    <div className="flex flex-col h-full bg-[#0d0d14] rounded-lg border border-green-500/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-green-500/10 flex items-center gap-2">
        <div className="w-1 h-4 bg-green-500 rounded-full" />
        <span className="text-[11px] font-mono font-semibold text-green-400 uppercase tracking-wider">
          Activity Log
        </span>
        <span className="ml-auto text-[10px] font-mono text-white/30">
          {entries.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {entries.length === 0 && (
          <div className="text-[11px] font-mono text-white/20 text-center py-4">
            no activity
          </div>
        )}
        {entries.map((entry, i) => (
          <div
            key={`${entry.timestamp}-${i}`}
            onClick={() => onSelect?.(entry)}
            className="flex items-start gap-1.5 px-1.5 py-1 hover:bg-white/[0.02] rounded transition-colors cursor-pointer"
          >
            <span className="text-[9px] font-mono text-white/20 shrink-0 mt-0.5 w-12">
              {new Date(entry.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span
              className={`text-[9px] font-mono px-1 py-0 rounded border shrink-0 ${sourceBadge[entry.source] || "bg-white/10 text-white/40 border-white/10"}`}
            >
              {entry.source}
            </span>
            <span className="text-[10px] font-mono text-green-300/70 shrink-0">
              {entry.action}
            </span>
            <span className="text-[10px] text-white/40 truncate">
              {entry.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
