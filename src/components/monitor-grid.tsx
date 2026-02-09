"use client";

import type { MonitorData } from "@/lib/types";
import { useDetail } from "@/lib/detail-context";
import { ThreadsPanel } from "@/components/panels/threads-panel";
import { SubagentsPanel } from "@/components/panels/subagents-panel";
import { PRWatchPanel } from "@/components/panels/pr-watch-panel";
import { SupportPanel } from "@/components/panels/support-panel";
import { ActivityPanel } from "@/components/panels/activity-panel";

export function MonitorGrid({ data }: { data: MonitorData }) {
  const { open } = useDetail();

  return (
    <div className="grid grid-cols-5 gap-3 h-full">
      <ThreadsPanel data={data.threads} onSelect={(t) => open({ type: "thread", data: t })} />
      <SubagentsPanel data={data.subagents} onSelect={(s) => open({ type: "subagent", data: s })} />
      <PRWatchPanel
        prWatch={data.prWatch}
        prState={data.prState}
        onSelect={(pr) => open({ type: "pr", data: pr })}
      />
      <SupportPanel data={data.featurebase} onSelect={(id) => open({ type: "support", data: { conversationId: id } })} />
      <ActivityPanel data={data.activityLog} onSelect={(e) => open({ type: "activity", data: e })} />
    </div>
  );
}
