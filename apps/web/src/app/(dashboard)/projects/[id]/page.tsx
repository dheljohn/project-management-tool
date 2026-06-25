// src/app/(dashboard)/projects/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../../lib/api";
import TaskModal from "../../../../components/tasks/TaskModal";

type TaskStatus = "Todo" | "In_Progress" | "Done";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
}

const COLUMNS: { label: string; status: TaskStatus; color: string }[] = [
  { label: "Todo", status: "Todo", color: "border-gray-500" },
  { label: "In Progress", status: "In_Progress", color: "border-yellow-500" },
  { label: "Done", status: "Done", color: "border-cyan-500" },
];

export default function KanbanPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]); // ✅ not undefined
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching project...");

        const projectRes = await api.get("/test02/get_project", {
          params: { id },
        });

        console.log("Project success");
        console.log(projectRes.data);

        console.log("Fetching tasks...");

        // const tasksRes = await api.get("/test03/get_all_tasks", {
        //   // params: { id },
        // });
        const tasksRes = await api.get("/test03/get_all_tasks_by_project", {
          params: { projectId: id },
        });

        console.log("Tasks success");
        console.log(tasksRes.data);

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
            onClick={() => {
              openCreateModal();
              console.log("Open create task modal");
            }} // hook up create task modal later
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
        {COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.status);

          return (
            <div
              key={col.status}
              className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b-2 ${col.color}`}
              >
                <h2 className="text-sm font-semibold text-white">
                  {col.label}
                </h2>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Task List */}
              <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1">
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 border border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-600 text-xs">No tasks</p>
                  </div>
                )}

                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors cursor-pointer group"
                  >
                    {/* Task Title */}
                    <p className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors">
                      {task.title}
                    </p>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-gray-400 text-xs mt-1.5 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Task Meta */}
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
                ))}
              </div>
            </div>
          );
        })}
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
  );
}
