"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ViewProvider, useView } from "../../../../context/ViewContext";
import { useBreadcrumbs } from "../../../../context/BreadcrumbContext";
import { useProject } from "../../../../features/projects/hooks/useProject";
import { useProjectTasks } from "../../../../features/projects/hooks/useProjectTasks";
import { useChangeLogs } from "../../../../features/logs/hooks/useChangeLogs";
import KanbanBoard from "../../../../features/tasks/components/KanbanBoard";
import ActivityLog from "../../../../components/ui/ActivityLog";
// import BoardToggle from "../../../../components/ui/FloatingButton";
import { useWip, WipProvider } from "../../../../context/WipContext";
import axios from "axios";
import ViewToggle from "../../../../components/ui/ViewToggle";
import { Task, TaskStatus } from "../../../../types/types";
import { celebrateProject } from "../../../../../lib/confetti";
import { Button } from "../../../../components/ui/Button";
import TaskModal from "../../../../features/tasks/components/TaskModal";
import { getProjectInitials } from "../../../utils/string";
import ActivityLogs from "../../../../components/ui/ActivityLogs";
export default function KanbanPage() {
  return (
    <ViewProvider>
      <WipProvider>
        <KanbanPageContent />
      </WipProvider>
    </ViewProvider>
  );
}

function KanbanPageContent() {
  const { id } = useParams();
  const projectId = Number(id);

  const { activeView } = useView();

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    error: projectErr,
    refetch: refetchProject,
  } = useProject(projectId);
  const { data: tasks = [] } = useProjectTasks(projectId);
  const { data: logs = [], isLoading: logsLoading } = useChangeLogs(projectId);

  const { setBreadcrumbs } = useBreadcrumbs();

  // const showKanban = activeView === "kanban" || activeView === "both";
  // const showActivity = activeView === "activity" || activeView === "both";

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  // const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  // const { isSplit } = useView();
  const { wipLimit } = useWip();
  const isFiringRef = useRef(false);

  // const [view, setView] = useState<>("");

  // const { mutate: updateTaskStatus } = useTaskStatusMutation(projectId);

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

  useEffect(() => {
    if (!project) return;
    setBreadcrumbs([
      { label: "Projects", href: "/projects" },
      { label: project.name },
    ]);
  }, [project, setBreadcrumbs]);

  if (projectLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 text-center min-h-[calc(100vh-64px)]">
        Loading Board...
      </div>
    );
  }

  if (projectError || !project) {
    const isRateLimited =
      axios.isAxiosError(projectErr) && projectErr.response?.status === 429;
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 text-center min-h-[calc(100vh-64px)]">
        <p className="text-destructive font-medium">
          {isRateLimited
            ? "Too many requests. Please wait a moment."
            : "Failed to load project."}
        </p>
        <button
          onClick={() => refetchProject()}
          className="text-accent text-sm hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Added max-h-screen or h-screen wrapper context to ensure scrolling cuts off properly */}
      <div className="h-screen-[calc(100vh-64px] w-full max-w-350 mx-auto flex flex-col gap-5 p-6 items-stretch overflow-hidden bg-background">
        {/* 2. Simplified Header Wrapper - removed conflicting alignment rules */}
        <div className="flex flex-col gap-1 w-full shrink-0">
          <div className="flex flex-row w-full justify-between items-start gap-4">
            <div className="flex flex-row items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-foreground text-sm font-bold tracking-wider uppercase select-none">
                {getProjectInitials(project.name)}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap align-baseline">
                  {" "}
                  {/* flex-wrap stops badge from jumping breaking text */}
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {project.name}
                  </h1>
                  {donePercent === 100 && total > 0 && (
                    <span className="px-3 py-1 inline-flex items-center gap-1 text-xs font-medium text-status-done bg-status-done/10 sm:px-2 sm:py-0.5 rounded-full shrink-0">
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
                      <span className="hidden sm:block">Complete</span>
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={openCreateModal}
              variant="add"
              className="hidden sm:inline-flex shrink-0 justify-center whitespace-nowrap"
            >
              Add Task
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-between border-b border-border w-full">
            <ViewToggle />
            <div className="hidden text-xs text-muted-foreground sm:block">
              {activeView === "kanban"
                ? "Drag cards between columns to update status"
                : "Most recent changes first"}
            </div>
            <Button
              onClick={openCreateModal}
              variant="add"
              className="block sm:hidden shrink-0 "
            >
              <span className="hidden sm:block">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
        {activeView === "kanban" ? (
          <KanbanBoard projectId={project.id} tasks={tasks} />
        ) : (
          <ActivityLogs projectId={project.id} />
          // <ActivityLog logs={logs} loading={logsLoading} />
        )}

        {modalOpen && (
          <TaskModal
            mode={modalMode}
            task={selectedTask}
            projectId={projectId}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

{
  /* <div className={`h-full flex flex-col p-0 items-center`}>
     
      <div className="flex flex-col justify-between  gap-2 px-4 py-3 bg-card max-w-[1400px] w-full ">
        <div className="flex flex-col items-start justify-between gap-1 min-w-0">
          <div className="flex flex-row w-full flex-1 justify-between">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="11" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
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
          <div className="mt-8 flex items-center justify-between border-b border-border w-full">
            <ViewToggle
              view={view}
              setView={setView}
              counts={{
                board: tasks.length,
                activity: 0,
              }}
            />
            <div className="hidden text-xs text-muted-foreground sm:block">
              {view === "board"
                ? "Drag cards between columns to update status"
                : "Most recent changes first"}
            </div>
          </div>
        </div>
      </div> */
}
