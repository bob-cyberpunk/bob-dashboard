"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaskCard } from "@/components/task-card";
import type { Task, WorkflowState, TaskStatus } from "@/lib/types";
import { COLUMNS } from "@/lib/types";

const columnAccent: Record<TaskStatus, string> = {
  inbox: "border-t-white/20",
  in_progress: "border-t-cyan-500",
  delegated: "border-t-purple-500",
  review: "border-t-yellow-500",
  done: "border-t-green-500",
};

const columnCount: Record<TaskStatus, string> = {
  inbox: "bg-white/10 text-white/50",
  in_progress: "bg-cyan-500/20 text-cyan-400",
  delegated: "bg-purple-500/20 text-purple-400",
  review: "bg-yellow-500/20 text-yellow-400",
  done: "bg-green-500/20 text-green-400",
};

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/events");

    es.addEventListener("init", (e) => {
      const data: WorkflowState = JSON.parse(e.data);
      setTasks(data.tasks);
      setLastUpdated(data.lastUpdated);
      setConnected(true);
    });

    es.addEventListener("update", (e) => {
      const data: WorkflowState = JSON.parse(e.data);
      setTasks(data.tasks);
      setLastUpdated(data.lastUpdated);
    });

    es.onerror = () => setConnected(false);
    es.onopen = () => setConnected(true);

    return () => es.close();
  }, []);

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        {/* Scanline overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]" />
        {/* Grid background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <header className="relative z-10 border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="animate-pulse text-cyan-400">Bob</span>{" "}
              <span className="text-yellow-400">⚡</span>{" "}
              <span className="text-white/80">Workflow</span>
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono text-white/30">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                />
                {connected ? "live" : "disconnected"}
              </div>
              {lastUpdated && (
                <>
                  <Separator
                    orientation="vertical"
                    className="h-3 bg-white/10"
                  />
                  <span>
                    updated {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="relative z-10 p-6">
          <div className="grid grid-cols-5 gap-4 h-[calc(100vh-5rem)]">
            {COLUMNS.map((col) => {
              const colTasks = tasksByStatus(col.key);
              return (
                <div
                  key={col.key}
                  className={`flex flex-col bg-white/[0.02] rounded-lg border-t-2 ${columnAccent[col.key]} border border-white/5`}
                >
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      {col.label}
                    </h2>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${columnCount[col.key]}`}
                    >
                      {colTasks.length}
                    </span>
                  </div>
                  <Separator className="bg-white/5" />
                  <ScrollArea className="flex-1 p-2">
                    <div className="space-y-2">
                      {colTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="text-center text-white/10 text-xs py-8 font-mono">
                          empty
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
