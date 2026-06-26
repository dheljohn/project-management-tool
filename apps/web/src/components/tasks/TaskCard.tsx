import React from "react";
import Draggable from "../DND/Draggable";

interface Task {
  id: string | number;
  title: string;
  description?: string;
  updatedAt: string | Date;
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Draggable id={String(task.id)}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors cursor-pointer group w-full text-left">
        <p className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors">
          {task.title}
        </p>

        {task.description && (
          <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">#{task.id}</span>
          <span className="text-xs text-gray-500">
            {new Date(task.updatedAt).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Draggable>
  );
}
