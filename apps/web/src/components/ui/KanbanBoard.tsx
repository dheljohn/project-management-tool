"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

import TaskModal from "../../components/tasks/TaskModal";
import { Task, TaskStatus } from "../../types/types";

import { DragDropProvider } from "@dnd-kit/react";
import { KanbanColumn } from "../tasks/KanbanColumn";

interface Project {
  id: number;
  name: string;
  description: string | null;
}

interface KanbanBoardProps {
  project: Project;
  projectId: number;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  refreshBoard: () => Promise<void>;
}

const COLUMNS = [
  { label: "Todo", status: "Todo", color: "border-gray-500" },
  {
    label: "In Progress",
    status: "In_Progress",
    color: "border-yellow-500",
  },
  { label: "Done", status: "Done", color: "border-cyan-500" },
] satisfies {
  label: string;
  status: TaskStatus;
  color: string;
}[];

export default function KanbanBoard({
  project,
  projectId,
  tasks,
  setTasks,
  refreshBoard,
}: KanbanBoardProps) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);

  function openCreateModal() {
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function getTasksByStatus(status: TaskStatus) {
    return tasks.filter((task) => task.status === status);
  }

  return (
    <DragDropProvider
      onDragEnd={async (event) => {
        if (event.canceled || !event.operation.source) return;

        const draggedId = event.operation.source.id;
        const rawTargetId = event.operation.target?.id;

        console.log("[DnD] draggedId:", draggedId);
        console.log("[DnD] rawTargetId:", rawTargetId);

        if (!rawTargetId) return;

        const targetStatus = String(rawTargetId).replace(
          /\s+/g,
          "_",
        ) as TaskStatus;

        console.log("[DnD] targetStatus:", targetStatus);

        const previousTasks = [...tasks];

        setTasks((prev) =>
          prev.map((task) =>
            String(task.id) === String(draggedId)
              ? { ...task, status: targetStatus }
              : task,
          ),
        );

        try {
          const payload = {
            task_id: Number(draggedId),
            status:
              targetStatus === "In_Progress" ? "In Progress" : targetStatus,
            user_id: localStorage.getItem("user_id"),
          };
          console.log("[DnD] PATCH payload:", payload);

          await api.patch("/test03/patch_task", payload);
          refreshBoard();
        } catch (err) {
          console.error("[DnD] PATCH failed:", err);
          setTasks(previousTasks);
        }
      }}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/projects")}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>

              {project.description && (
                <p className="text-gray-400 text-sm">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/projects/${projectId}/changelog`)}
              className="border border-gray-700 rounded-lg px-3 py-2"
            >
              Changelog
            </button>

            <button
              onClick={openCreateModal}
              className="bg-cyan-500 rounded-lg px-4 py-2"
            >
              + Add Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={getTasksByStatus(column.status)}
            />
          ))}
        </div>

        {modalOpen && (
          <TaskModal
            projectId={projectId}
            onClose={closeModal}
            onSuccess={(newTask) => {
              setTasks((prev) => [...prev, newTask]);

              void refreshBoard();

              closeModal();
            }}
          />
        )}
      </div>
    </DragDropProvider>
  );
}
