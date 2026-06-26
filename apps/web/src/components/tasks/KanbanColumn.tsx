import React from "react";
import Droppable from "../DND/Droppable";
import { TaskCard } from "./TaskCard";

interface Column {
  status: string;
  color: string;
  label: string;
}

interface KanbanColumnProps {
  column: Column;
  tasks: any[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b-2 w-full ${column.color}`}
      >
        <h2 className="text-sm font-semibold text-white">{column.label}</h2>
        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Task List container wrapped in Droppable */}
      <Droppable id={column.status}>
        <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1 w-full">
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-600 text-xs">No tasks</p>
            </div>
          )}

          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </Droppable>
    </div>
  );
}
