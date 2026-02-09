"use client";

import type { ThreadInfo } from "@/lib/types";

const statusDot: Record<string, string> = {
  active: "bg-blue-400 animate-pulse",
  waiting: "bg-yellow-400",
  resolved: "bg-green-400",
};

export function ThreadDetail({ thread }: { thread: ThreadInfo }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${statusDot[thread.status]}`} />
        <span className="text-xs font-mono text-blue-300">#{thread.channel}</span>
        <span className="text-[10px] font-mono text-white/30 ml-auto">{thread.status}</span>
      </div>

      <a
        href={`https://app.slack.com/client/`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
      >
        ↗ Open in Slack
      </a>

      <Section label="Topic">
        <p className="text-[11px] text-white/60">{thread.topic || "No topic set"}</p>
      </Section>

      <Section label="Last Message">
        <p className="text-[11px] text-white/50 whitespace-pre-wrap bg-white/[0.03] rounded p-2 border border-white/5">
          {thread.lastMessage || "—"}
        </p>
      </Section>

      <Section label="Participants">
        <div className="flex flex-wrap gap-1">
          {thread.participants.map((p) => (
            <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {p}
            </span>
          ))}
          {thread.participants.length === 0 && (
            <span className="text-[11px] font-mono text-white/20">none</span>
          )}
        </div>
      </Section>

      <Section label="Last Activity">
        <span className="text-[11px] font-mono text-white/40">
          {new Date(thread.lastActivity).toLocaleString()}
        </span>
      </Section>

      <Section label="Thread ID">
        <span className="text-[10px] font-mono text-white/20 break-all">{thread.id}</span>
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
