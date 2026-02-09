"use client";

interface SupportDetailData {
  conversationId: string;
}

export function SupportDetail({ data }: { data: SupportDetailData }) {
  const fbUrl = `https://creem.featurebase.app/dashboard/inbox/conversation/${data.conversationId}`;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-orange-300 font-mono">
        Conversation #{data.conversationId}
      </h2>

      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
      >
        ↗ Open in FeatureBase
      </a>

      <Section label="Conversation ID">
        <span className="text-[11px] font-mono text-white/40">{data.conversationId}</span>
      </Section>

      <div className="text-[11px] text-white/20 font-mono italic mt-8">
        Full conversation details are available in FeatureBase.
      </div>
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
