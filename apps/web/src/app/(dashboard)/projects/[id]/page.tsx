"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../../lib/api";
import TaskModal from "../../../../components/tasks/TaskModal";
import { Task, TaskStatus } from "../../../../types/task";

import { DragDropProvider } from "@dnd-kit/react";
import Draggable from "../../../../components/DND/Draggable";
import Droppable from "../../../../components/DND/Droppable";
import { KanbanColumn } from "../../../../components/tasks/KanbanColumn";

interface Project {
  id: number;
  name: string;
  description: string | null;
}

const COLUMNS: { label: string; status: TaskStatus; color: string }[] = [
  { label: "Todo", status: "Todo", color: "border-gray-500" },
  { label: "In_Progress", status: "In_Progress", color: "border-yellow-500" },
  { label: "Done", status: "Done", color: "border-cyan-500" },
];

export default function KanbanPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!id) return;
        setLoading(true);

        const projectRes = await api.get("/test02/get_project", {
          params: { id },
        });

        const tasksRes = await api.get("/test03/get_all_tasks_by_project", {
          params: { projectId: id },
        });

        console.log(projectRes.data, tasksRes.data);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch {
        setError("Failed to load board.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  function openCreateModal() {
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  function handleTaskSuccess(task: Task) {
    setTasks((prev) => [...prev, task]);
    closeModal();
  }

  function getTasksByStatus(status: TaskStatus) {
    return Array.isArray(tasks) ? tasks.filter((t) => t.status === status) : [];
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Loading board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragEnd={async (event) => {
        if (event.canceled || !event.operation.source) return;

        const draggedId = event.operation.source.id;
        const rawTargetId = event.operation.target?.id;
        if (!rawTargetId) return;

        const targetColumnId = String(rawTargetId).replace(
          /\s+/g,
          "_",
        ) as TaskStatus;
        const previousTasks = [...tasks];

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            String(task.id) === String(draggedId)
              ? { ...task, status: targetColumnId }
              : task,
          ),
        );

        try {
          const taskIdNumber = Number(draggedId);
          const payloadStatus =
            targetColumnId === "In_Progress" ? "In Progress" : targetColumnId;

          await api.patch(`/test03/patch_task`, {
            project_id: taskIdNumber,
            status: payloadStatus,
          });

          console.log(
            `Successfully updated task ${draggedId} to status: ${payloadStatus}`,
          );
        } catch (err) {
          console.error("Failed to update task status on backend:", err);
          setTasks(previousTasks);
          alert("Failed to save changes. Please try dragging again.");
        }
      }}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/projects")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
              {project?.description && (
                <p className="text-gray-400 text-sm mt-0.5">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/projects/${id}/changelog`)}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Changelog
            </button>
            <button
              className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
              onClick={openCreateModal}
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              column={col}
              tasks={getTasksByStatus(col.status)}
            />
          ))}
        </div>

        {/* Modal */}
        {modalOpen && (
          <TaskModal
            onClose={closeModal}
            onSuccess={handleTaskSuccess}
            projectId={Number(id)}
          />
        )}
      </div>
    </DragDropProvider>
  );
}
