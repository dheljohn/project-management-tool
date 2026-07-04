import React from "react";
import Draggable from "../../../components/DND/Draggable";
import { Task } from "../../../types/types";
import { PriorityBadge } from "../../../components/ui/PriorityBadge";
import { PRIORITY_CONFIG } from "../../../../lib/priority";
import { getUserInitials } from "../../../app/utils/getUserInitials";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  isJustCompleted?: boolean;
}

export function TaskCard({ task, onClick, isJustCompleted }: TaskCardProps) {
  const config = PRIORITY_CONFIG[task.priority];
  const isInDone = task.status === "Done";

  return (
    <Draggable id={String(task.id)}>
      <div
        className={`
          bg-card border  border-l-2 rounded-lg p-4  transition-colors cursor-grab group w-full text-left 
          ${isJustCompleted ? "animate-task-complete opacity-50 cursor-default pointer-events-none border-2 border-destructive/40 rounded-xl " : " "} `}
        onClick={() => onClick(task)}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-foreground text-sm font-medium group-hover:text-accent transition-colors flex-1 ${isInDone ? "line-through  opacity-50" : " "}
              `}
          >
            {task.title}
          </p>
          <PriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">#{task.id}</span>

          <div className="flex items-center gap-2">
            {task.assignee && (
              <div
                title={task.assignee.username ?? task.assignee.user_id}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-[10px] font-semibold uppercase select-none"
              >
                {getUserInitials(
                  task.assignee.username ?? task.assignee.user_id,
                )}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(task.updatedAt).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
