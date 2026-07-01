"use client";

import React from "react";
import Droppable from "../../../components/DND/Droppable";
import { TaskCard } from "./TaskCard";
import { Column, Task } from "../../../types/types";
import { useWip } from "../../../context/WipContext";
import { WipControl } from "../../../components/ui/WipControl";
import { sortByPriority } from "../../../../lib/priority";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  completedTaskId: number | null;
}

export function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  completedTaskId,
}: KanbanColumnProps) {
  const { wipLimit } = useWip();
  const isInProgress = column.status === "In_Progress";

  const isAtLimit =
    isInProgress && wipLimit !== null && tasks.length >= wipLimit;

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background rounded-xl">
      <Droppable id={column.status} disabled={isAtLimit}>
        {({ isDropTarget }) => {
          const isHovering = isDropTarget;
          return (
            <div
              className={`flex flex-col p-0 overflow-y-auto flex-1 w-full rounded-xl transition-all
    ${
      isHovering && !isAtLimit
        ? "bg-background border-2 border-accent animate-[blink_1.2s_ease-in-out_infinite]"
        : isAtLimit
          ? "border-2 border-destructive/30"
          : isHovering && isAtLimit
            ? "border-2 border-destructive bg-destructive/10"
            : "border border-border"
    }`}
            >
              <header className="sticky top-0 z-10 bg-background px-6 py-2 border-b border-border items-center justify-center align-center">
                <div
                  className={`flex items-center justify-between ${column.color}`}
                >
                  <div className="flex items-center gap-2 ">
                    {/* <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {tasks.length}
                    </span> */}

                    <h2 className="text-lg font-semibold text-foreground">
                      {column.label}
                    </h2>
                  </div>
                  {isInProgress ? (
                    <WipControl inProgressCount={tasks.length} />
                  ) : null}
                </div>
              </header>
              {isAtLimit && (
                <div className="flex items-center justify-center text-xs  text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mx-3 mt-3">
                  <p className="items-center align-middle">
                    {" "}
                    WIP limit reached.
                  </p>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-lg m-5">
                  <p className="text-muted-foreground text-xs">No tasks</p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {sortByPriority(tasks).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                    isJustCompleted={task.id === completedTaskId}
                  />
                ))}
              </div>
            </div>
          );
        }}
      </Droppable>
    </div>
  );
}
