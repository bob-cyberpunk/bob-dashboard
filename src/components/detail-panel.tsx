"use client";

import { useEffect, useRef } from "react";
import { useDetail } from "@/lib/detail-context";
import { TaskDetail } from "@/components/details/task-detail";
import { ThreadDetail } from "@/components/details/thread-detail";
import { SubagentDetail } from "@/components/details/subagent-detail";
import { PRDetail } from "@/components/details/pr-detail";
import { SupportDetail } from "@/components/details/support-detail";
import { ActivityDetail } from "@/components/details/activity-detail";

export function DetailPanel() {
  const { item, close } = useDetail();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (item) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [item, close]);

  if (!item) return null;

  function renderContent() {
    if (!item) return null;
    switch (item.type) {
      case "task":
        return <TaskDetail task={item.data} />;
      case "thread":
        return <ThreadDetail thread={item.data} />;
      case "subagent":
        return <SubagentDetail session={item.data} />;
      case "pr":
        return <PRDetail data={item.data} />;
      case "support":
        return <SupportDetail data={item.data} />;
      case "activity":
        return <ActivityDetail entry={item.data} />;
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={close}
      />
      {/* Drawer */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-[400px] z-[70] bg-[#0c0c14] border-l border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.05)] animate-slide-in overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50">
            {item.type} details
          </span>
          <button
            onClick={close}
            className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
