import React from "react";
import Droppable from "../DND/Droppable";

import { TaskCard } from "./TaskCard";
import { Column, Task } from "../../types/types";

interface KanbanColumnProps {
  column: Column;
  tasks: any[];
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onTaskClick,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background rounded-xl">
      {/*  Task List  */}
      <Droppable id={column.status}>
        {({
          isDropTarget,
          isOver,
        }: {
          isDropTarget?: boolean;
          isOver?: boolean;
        }) => {
          const isHovering = isDropTarget || isOver;

          return (
            <div
              className={`flex flex-col gap-3 p-6 overflow-y-auto flex-1 w-full   ${
                isHovering
                  ? "bg-background border-2 border-accent rounded-xl animate-[blink_1.2s_ease-in-out_infinite]"
                  : "border rounded-xl"
              }  `}
            >
              {/*  Column Header  */}
              <div
                className={`flex items-center justify-between  ${column.color} mb-1`}
              >
                <h2 className="text-lg font-semibold text-foreground">
                  {column.label}
                </h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              </div>

              {tasks.length === 0 && !isHovering && (
                <div className="flex items-center justify-center h-24 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground text-xs">No tasks</p>
                </div>
              )}

              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
}
