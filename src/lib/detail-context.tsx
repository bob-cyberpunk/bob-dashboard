"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Task, ThreadInfo, SubagentSession, ActivityEntry } from "@/lib/types";

export type DetailItem =
  | { type: "task"; data: Task }
  | { type: "thread"; data: ThreadInfo }
  | { type: "subagent"; data: SubagentSession }
  | { type: "pr"; data: { prNumber: string; ciStatus: string; bugbotComments: number[]; inProgress?: string } }
  | { type: "support"; data: { conversationId: string } }
  | { type: "activity"; data: ActivityEntry };

interface DetailContextValue {
  item: DetailItem | null;
  open: (item: DetailItem) => void;
  close: () => void;
}

const DetailContext = createContext<DetailContextValue>({
  item: null,
  open: () => {},
  close: () => {},
});

export function DetailProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<DetailItem | null>(null);
  const open = useCallback((i: DetailItem) => setItem(i), []);
  const close = useCallback(() => setItem(null), []);

  return (
    <DetailContext.Provider value={{ item, open, close }}>
      {children}
    </DetailContext.Provider>
  );
}

export function useDetail() {
  return useContext(DetailContext);
}
