"use client";

import { useState, useRef, useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { Task, TaskStatus } from "../../../types/types";
import { KanbanColumn } from "./KanbanColumn";
import { useTaskStatusMutation } from "../hooks/useTaskStatusMutation";
import TaskModal from "./TaskModal";
import { celebrateProject } from "../../../../lib/confetti";

interface KanbanBoardProps {
  projectId: number;
  tasks: Task[];
  wipLimit: number | null;
}

const COLUMNS = [
  { label: "To do", status: "Todo", color: "border-status-todo" },
  {
    label: "In Progress",
    status: "In_Progress",
    color: "border-status-progress",
  },
  { label: "Done", status: "Done", color: "border-status-done" },
] satisfies { label: string; status: TaskStatus; color: string }[];

export default function KanbanBoard({
  projectId,
  tasks,
  wipLimit,
}: KanbanBoardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const isFiringRef = useRef(false);

  const { mutate: updateTaskStatus } = useTaskStatusMutation(projectId);

  const isProjectCompleted =
    tasks.length > 0 && tasks.every((task) => task.status === "Done");
  const wasCompleted = useRef(false);

  useEffect(() => {
    if (!wasCompleted.current && isProjectCompleted) {
      celebrateProject(); // canvas-confetti
    }

    wasCompleted.current = isProjectCompleted;
  }, [isProjectCompleted]);

  function getTasksByStatus(status: TaskStatus) {
    return tasks.filter((t) => t.status === status);
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

        if (targetStatus === "In_Progress" && wipLimit !== null) {
          const currentInProgressCount = getTasksByStatus("In_Progress").length;
          if (currentInProgressCount >= wipLimit) {
            return;
          }
        }

        // Trigger the pulse explicitly, driven by the actual drag action
        if (targetStatus === "Done") {
          const id = Number(draggedId);
          setCompletedTaskId(id);
          setTimeout(() => {
            setCompletedTaskId((current) => (current === id ? null : current));
          }, 900);
        }

        updateTaskStatus({
          task_id: Number(draggedId),
          status: targetStatus === "In_Progress" ? "In Progress" : targetStatus,
          // user_id: localStorage.getItem("user_id"),
        });
      }}
    >
      <div className="h-full flex flex-col gap-5">
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden `}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={getTasksByStatus(column.status)}
              onTaskClick={openUpdateModal}
              completedTaskId={completedTaskId}
              projectId={projectId}
              wipLimit={wipLimit}
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
