"use client";

interface PRDetailData {
  prNumber: string;
  ciStatus: string;
  bugbotComments: number[];
  inProgress?: string;
}

function ciColor(status: string): string {
  if (status === "pass") return "text-green-400";
  if (status.startsWith("fail")) return "text-red-400";
  if (status === "pending") return "text-yellow-400";
  return "text-white/40";
}

function ciBg(status: string): string {
  if (status === "pass") return "bg-green-500/10 border-green-500/20";
  if (status.startsWith("fail")) return "bg-red-500/10 border-red-500/20";
  if (status === "pending") return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-white/5 border-white/10";
}

export function PRDetail({ data }: { data: PRDetailData }) {
  const ghUrl = `https://github.com/AdrianMouzworthy/pugpay-monorepo/pull/${data.prNumber}`;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-cyan-300 font-mono">
        PR #{data.prNumber}
      </h2>

      <a
        href={ghUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
      >
        ↗ Open in GitHub
      </a>

      <Section label="CI Status">
        <div className={`text-[11px] font-mono px-2.5 py-1.5 rounded border ${ciBg(data.ciStatus)}`}>
          <span className={ciColor(data.ciStatus)}>{data.ciStatus}</span>
        </div>
      </Section>

      <Section label={`Bugbot Comments (${data.bugbotComments.length})`}>
        {data.bugbotComments.length === 0 ? (
          <span className="text-[11px] font-mono text-white/20">none</span>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {data.bugbotComments.map((id) => (
              <div key={id} className="text-[10px] font-mono text-white/30 bg-white/[0.03] rounded px-2 py-1 border border-white/5">
                <a
                  href={`${ghUrl}#pullrequestreview-${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  comment #{id}
                </a>
              </div>
            ))}
          </div>
        )}
      </Section>

      {data.inProgress && (
        <Section label="In Progress">
          <span className="text-[11px] font-mono text-white/40 break-all">
            {data.inProgress.startsWith("agent:") ? (
              <span className="text-purple-300">🤖 Subagent assigned</span>
            ) : (
              data.inProgress
            )}
          </span>
        </Section>
      )}
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
