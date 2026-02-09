"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Task } from "@/lib/types";

function timeElapsed(from: string): string {
  const ms = Date.now() - new Date(from).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

const priorityStyles: Record<string, string> = {
  high: "shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-500/30",
  medium: "shadow-[0_0_15px_rgba(234,179,8,0.2)] border-yellow-500/30",
  low: "border-white/5",
};

const priorityBadge: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-white/10 text-white/50 border-white/10",
};

const subagentStatusColor: Record<string, string> = {
  running: "text-cyan-400",
  completed: "text-green-400",
  failed: "text-red-400",
};

export function TaskCard({ task }: { task: Task }) {
  const isSubagent = task.assignee?.startsWith("subagent:") ?? false;
  const avatar = isSubagent ? "🤖" : "⚡";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card
          className={`bg-[#12121a] border transition-all duration-300 hover:scale-[1.02] hover:brightness-110 ${priorityStyles[task.priority]}`}
        >
          <CardHeader className="p-3 pb-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium text-white/90 leading-tight">
                {task.title}
              </CardTitle>
              <span className="text-lg shrink-0">{avatar}</span>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1 space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${priorityBadge[task.priority]}`}
              >
                {task.priority}
              </Badge>
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-300 border-purple-500/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {task.subagentInfo && (
              <div className="text-[11px] font-mono space-y-0.5">
                <div className="text-white/40">
                  model:{" "}
                  <span className="text-cyan-400">
                    {task.subagentInfo.model}
                  </span>
                </div>
                <div className="text-white/40">
                  status:{" "}
                  <span
                    className={
                      subagentStatusColor[task.subagentInfo.status] ||
                      "text-white/60"
                    }
                  >
                    {task.subagentInfo.status}
                    {task.subagentInfo.status === "running" && (
                      <span className="animate-pulse"> ●</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] font-mono text-white/30">
              <span>{task.source}</span>
              <span>{timeElapsed(task.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="max-w-xs bg-[#1a1a2e] border-white/10 text-white/80"
      >
        <p className="text-xs">{task.description}</p>
        <p className="text-[10px] font-mono text-white/40 mt-1">
          {task.id}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
