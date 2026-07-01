"use client";

import { useState, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { Task, TaskStatus } from "../../../types/types";
import { KanbanColumn } from "./KanbanColumn";
import { useView } from "../../../context/ViewContext";
import { Button } from "../../../components/ui/Button";
import { useTaskStatusMutation } from "../hooks/useTaskStatusMutation";
import TaskModal from "./TaskModal";

interface Project {
  id: number;
  name: string;
  description: string | null;
}

interface KanbanBoardProps {
  project: Project;
  projectId: number;
  tasks: Task[];
}

const COLUMNS = [
  { label: "Todo", status: "Todo", color: "border-status-todo" },
  {
    label: "In Progress",
    status: "In_Progress",
    color: "border-status-progress",
  },
  { label: "Done", status: "Done", color: "border-status-done" },
] satisfies { label: string; status: TaskStatus; color: string }[];

export default function KanbanBoard({
  project,
  projectId,
  tasks,
}: KanbanBoardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const { isSplit } = useView();
  const isFiringRef = useRef(false);

  const { mutate: updateTaskStatus } = useTaskStatusMutation(projectId);

  function getTasksByStatus(status: TaskStatus) {
    return tasks.filter((t) => t.status === status);
  }

  const total = tasks.length;
  const doneCount = getTasksByStatus("Done").length;
  const donePercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  function openCreateModal() {
    setSelectedTask(undefined);
    setModalMode("create");
    setModalOpen(true);
  }

  function openUpdateModal(task: Task) {
    setSelectedTask(task);
    setModalMode("update");
    setModalOpen(true);
  }

  return (
    <DragDropProvider
      onDragEnd={async (event) => {
        if (isFiringRef.current) return;
        isFiringRef.current = true;
        setTimeout(() => {
          isFiringRef.current = false;
        }, 500);

        if (event.canceled || !event.operation.source) return;

        const draggedId = event.operation.source.id;
        const rawTargetId = event.operation.target?.id;
        if (!rawTargetId) return;

        const targetStatus = String(rawTargetId).replace(
          /\s+/g,
          "_",
        ) as TaskStatus;
        const currentTask = tasks.find(
          (t) => String(t.id) === String(draggedId),
        );
        if (!currentTask || currentTask.status === targetStatus) return;

        updateTaskStatus({
          task_id: Number(draggedId),
          status: targetStatus === "In_Progress" ? "In Progress" : targetStatus,
          user_id: localStorage.getItem("user_id"),
        });
      }}
    >
      <div className="h-full flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground truncate">
                {project.name}
              </h1>
              {donePercent === 100 && total > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-status-done bg-status-done/10 px-2 py-0.5 rounded-full">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Complete
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {project.description}
              </p>
            )}
          </div>
          <Button onClick={openCreateModal} variant="add">
            Add Task
          </Button>
        </div>

        <div
          className={`grid grid-cols-3 gap-4 flex-1 overflow-hidden ${isSplit ? "mb-10" : "mb-18"}`}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={getTasksByStatus(column.status)}
              onTaskClick={openUpdateModal}
            />
          ))}
        </div>

        {modalOpen && (
          <TaskModal
            mode={modalMode}
            task={selectedTask}
            projectId={projectId}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </DragDropProvider>
  );
}
