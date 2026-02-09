"use client";

import type { ActivityEntry } from "@/lib/types";

const sourceBadge: Record<string, string> = {
  heartbeat: "bg-green-500/20 text-green-400 border-green-500/30",
  slack: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cron: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manual: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function ActivityDetail({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${sourceBadge[entry.source] || "bg-white/10 text-white/40 border-white/10"}`}>
          {entry.source}
        </span>
        <span className="text-[11px] font-mono text-green-300/70">{entry.action}</span>
      </div>

      <Section label="Timestamp">
        <span className="text-[11px] font-mono text-white/50">
          {new Date(entry.timestamp).toLocaleString()}
        </span>
      </Section>

      <Section label="Action">
        <span className="text-[11px] font-mono text-white/60">{entry.action}</span>
      </Section>

      <Section label="Detail">
        <p className="text-[11px] text-white/50 whitespace-pre-wrap leading-relaxed bg-white/[0.03] rounded p-3 border border-white/5">
          {entry.detail}
        </p>
      </Section>

      <Section label="Source">
        <span className="text-[11px] font-mono text-white/40">{entry.source}</span>
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
