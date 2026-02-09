"use client";

import { useState } from "react";
import type { FeaturebaseState } from "@/lib/types";

export function SupportPanel({ data }: { data: FeaturebaseState }) {
  const [completing, setCompleting] = useState<string | null>(null);
  const [localCompleted, setLocalCompleted] = useState<string[]>([]);

  const completed = new Set([
    ...(data.completedConversationIds || []),
    ...localCompleted,
  ]);
  const recentIds = (data.knownConversationIds || []).slice(0, 20);
  const activeIds = recentIds.filter((id) => !completed.has(id));
  const completedIds = recentIds.filter((id) => completed.has(id));
  const [showCompleted, setShowCompleted] = useState(false);

  async function markComplete(id: string) {
    setCompleting(id);
    try {
      await fetch(`/api/conversations/${id}/complete`, { method: "POST" });
      setLocalCompleted((prev) => [...prev, id]);
    } catch {
      /* ignore */
    }
    setCompleting(null);
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d14] rounded-lg border border-orange-500/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-orange-500/10 flex items-center gap-2">
        <div className="w-1 h-4 bg-orange-500 rounded-full" />
        <span className="text-[11px] font-mono font-semibold text-orange-400 uppercase tracking-wider">
          Support Queue
        </span>
        <span className="ml-auto text-[10px] font-mono text-white/30">
          {data.knownConversationIds?.length || 0} known
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {activeIds.length === 0 && (
          <div className="text-[11px] font-mono text-white/20 text-center py-4">
            queue clear
          </div>
        )}
        {activeIds.map((id) => (
          <div
            key={id}
            className="bg-white/[0.03] rounded px-2.5 py-1 border border-white/5 hover:border-orange-500/20 transition-colors flex items-center gap-2"
          >
            <span className="text-[11px] font-mono text-orange-300">
              #{id}
            </span>
            <span className="flex-1" />
            <button
              onClick={() => markComplete(id)}
              disabled={completing === id}
              className="text-[11px] hover:bg-green-500/20 rounded px-1 transition-colors disabled:opacity-30"
              title="Mark complete"
            >
              ✅
            </button>
          </div>
        ))}
        {completedIds.length > 0 && (
          <>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-[10px] font-mono text-white/20 hover:text-white/40 transition-colors w-full text-left px-1 py-1"
            >
              {showCompleted ? "▾" : "▸"} {completedIds.length} completed
            </button>
            {showCompleted &&
              completedIds.map((id) => (
                <div
                  key={id}
                  className="bg-white/[0.01] rounded px-2.5 py-1 border border-white/[0.03] opacity-40"
                >
                  <span className="text-[11px] font-mono text-white/30">
                    #{id} ✓
                  </span>
                </div>
              ))}
          </>
        )}
      </div>
      <div className="px-3 py-1 border-t border-white/5 text-[9px] font-mono text-white/15">
        last check{" "}
        {data.lastSupportCheckTs
          ? new Date(data.lastSupportCheckTs * 1000).toLocaleTimeString()
          : "never"}
      </div>
    </div>
  );
}
