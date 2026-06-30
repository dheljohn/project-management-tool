import React from "react";

interface ProjectProgressProps {
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

export const ProjectProgress = ({
  todoCount,
  inProgressCount,
  doneCount,
}: ProjectProgressProps) => {
  const total = todoCount + inProgressCount + doneCount;

  const donePercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-2 bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-status-todo" />
            {todoCount} Todo
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-status-progress" />
            {inProgressCount} In Progress
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-status-done" />
            {doneCount} Done
          </span>
        </div>
        <span
          className={`text-xs font-semibold tabular-nums
          ${donePercent === 100 ? "text-status-done" : "text-foreground"}`}
        >
          {donePercent}% complete
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-0.5">
        {doneCount > 0 && (
          <div
            className="h-full bg-status-done rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        )}
        {inProgressCount > 0 && (
          <div
            className="h-full bg-status-progress rounded-full transition-all duration-500"
            style={{ width: `${(inProgressCount / total) * 100}%` }}
          />
        )}
        {todoCount > 0 && (
          <div
            className="h-full bg-status-todo rounded-full transition-all duration-500"
            style={{ width: `${(todoCount / total) * 100}%` }}
          />
        )}
      </div>
    </div>
  );
};
