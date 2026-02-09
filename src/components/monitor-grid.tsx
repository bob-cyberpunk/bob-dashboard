"use client";

import type { MonitorData } from "@/lib/types";
import { ThreadsPanel } from "@/components/panels/threads-panel";
import { SubagentsPanel } from "@/components/panels/subagents-panel";
import { PRWatchPanel } from "@/components/panels/pr-watch-panel";
import { SupportPanel } from "@/components/panels/support-panel";
import { ActivityPanel } from "@/components/panels/activity-panel";

export function MonitorGrid({ data }: { data: MonitorData }) {
  return (
    <div className="grid grid-cols-5 gap-3 h-full">
      <ThreadsPanel data={data.threads} />
      <SubagentsPanel data={data.subagents} />
      <PRWatchPanel prWatch={data.prWatch} prState={data.prState} />
      <SupportPanel data={data.featurebase} />
      <ActivityPanel data={data.activityLog} />
    </div>
  );
}
