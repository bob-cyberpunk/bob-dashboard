"use client";

import type { PRWatchState, PRState } from "@/lib/types";

function ciColor(status: string): string {
  if (status === "pass") return "text-green-400";
  if (status.startsWith("fail")) return "text-red-400";
  if (status === "pending") return "text-yellow-400 animate-pulse";
  return "text-white/40";
}

function ciGlow(status: string): string {
  if (status.startsWith("fail")) return "shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  if (status === "pass") return "";
  if (status === "pending") return "";
  return "";
}

export function PRWatchPanel({
  prWatch,
  prState,
  onSelect,
}: {
  prWatch: PRWatchState;
  prState: PRState;
  onSelect?: (data: { prNumber: string; ciStatus: string; bugbotComments: number[]; inProgress?: string }) => void;
}) {
  const prNumbers = Object.keys(prWatch.lastCIStatus || {}).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <div className="flex flex-col h-full bg-[#0d0d14] rounded-lg border border-cyan-500/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-cyan-500/10 flex items-center gap-2">
        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
        <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider">
          PR Watch
        </span>
        <span className="ml-auto text-[10px] font-mono text-white/30">
          {prState.knownPRs?.length || 0} tracked
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {prNumbers.length === 0 && (
          <div className="text-[11px] font-mono text-white/20 text-center py-4">
            no PRs tracked
          </div>
        )}
        {prNumbers.map((pr) => {
          const ci = prWatch.lastCIStatus[pr] || "unknown";
          const bugbotCount = (prWatch.knownBugbotComments?.[pr] || []).length;
          const inProgress = prWatch.inProgressBySubagent?.[pr];
          return (
            <div
              key={pr}
              onClick={() => onSelect?.({ prNumber: pr, ciStatus: ci, bugbotComments: prWatch.knownBugbotComments?.[pr] || [], inProgress })}
              className={`bg-white/[0.03] rounded px-2.5 py-1.5 border border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer ${ciGlow(ci)}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-300">
                  #{pr}
                </span>
                <span className={`text-[10px] font-mono ${ciColor(ci)}`}>
                  CI: {ci.startsWith("fail") ? "fail" : ci}
                </span>
                {bugbotCount > 0 && (
                  <span className="text-[10px] font-mono text-orange-400">
                    🐛 {bugbotCount}
                  </span>
                )}
              </div>
              {inProgress && (
                <div className="text-[10px] font-mono text-white/20 truncate mt-0.5">
                  {inProgress.startsWith("agent:") ? "🤖 subagent" : inProgress}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {prWatch.lastChecked && (
        <div className="px-3 py-1 border-t border-white/5 text-[9px] font-mono text-white/15">
          checked {new Date(prWatch.lastChecked).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
