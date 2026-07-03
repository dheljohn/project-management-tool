"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChangeLog } from "../../types/types";
import { useChangeLogs } from "../../features/logs/hooks/useChangeLogs";
import ActivityLog from "./ActivityLog";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Created", value: "task creation" },
  { label: "Status", value: "status" },
  { label: "Updated", value: "description" },
];

export default function ActivityLogs({ projectId }: { projectId: number }) {
  const [filter, setFilter] = useState("all");
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useChangeLogs(projectId, filter === "all" ? undefined : filter);

  const logs = data?.pages.flatMap((page) => page.items) ?? [];

  const observerRef = useRef<HTMLDivElement | null>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 1 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${
                filter === f.value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ActivityLog logs={logs} loading={isLoading} />

      <div ref={observerRef} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        )}
        {!hasNextPage && logs.length > 0 && (
          <p className="text-xs text-muted-foreground">No more activity</p>
        )}
      </div>
    </div>
  );
}
