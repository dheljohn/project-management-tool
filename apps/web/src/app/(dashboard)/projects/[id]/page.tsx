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
import axios from "axios";
import ViewToggle from "../../../../components/ui/ViewToggle";
import { Task, TaskStatus } from "../../../../types/types";
import { celebrateProject } from "../../../../../lib/confetti";
import { Button } from "../../../../components/ui/Button";
import TaskModal from "../../../../features/tasks/components/TaskModal";
import { getProjectInitials } from "../../../utils/string";
import ActivityLogs from "../../../../components/ui/ActivityLogs";
import { useWip, WipProvider } from "../../../../context/WipContext";
import { useTaskStatusMutation } from "../../../../features/tasks/hooks/useTaskStatusMutation";
import { GenerateInviteModal } from "../../../../features/invite/components/GenerateInviteModal";
import { useProjectSocket } from "../../../../features/tasks/hooks/useProjectSocket";
import { useIsProjectOwner } from "../../../../features/tasks/hooks/useIsProjectOwner";
import { MoveUpRight } from "lucide-react";

export default function KanbanPage() {
  return (
    <ViewProvider>
      <KanbanPageContent />
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
  useProjectSocket(projectId);

  // const showKanban = activeView === "kanban" || activeView === "both";
  // const showActivity = activeView === "activity" || activeView === "both";

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { mutate: updateTaskStatus } = useTaskStatusMutation(projectId);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

  function OwnerOnly({
    projectId,
    children,
  }: {
    projectId: number;
    children: React.ReactNode;
  }) {
    const isOwner = useIsProjectOwner(projectId);
    if (!isOwner) return null;
    return <>{children}</>;
  }

  function openUpdateModal(task: Task) {
    setSelectedTask(task);
    setModalMode("update");
    setModalOpen(true);
  }

  function closeModal() {
    setSelectedTask(undefined);
    setModalOpen(false);
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
    const isAxiosError = axios.isAxiosError(projectErr);
    const status = isAxiosError ? projectErr.response?.status : null;

    // 1. Handle Rate Limiting (429)
    if (status === 429) {
      return (
        <div className="w-full flex flex-col items-center justify-center gap-3 text-center min-h-[calc(100vh-64px)]">
          <p className="text-destructive font-medium">
            Too many requests. Please wait a moment.
          </p>
          <Button
            variant="save"
            onClick={() => refetchProject()}
            className="text-accent text-sm hover:underline"
          >
            Try again
          </Button>
        </div>
      );
    }

    // 2. Handle Unauthorized / Not Your Project (403 or 404)
    if (status === 403 || status === 404) {
      return (
        <div className="w-full flex flex-col items-center justify-center gap-4 text-center min-h-[calc(100vh-64px)] px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            🔒
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-foreground">
              Access Denied
            </h1>
            <p className="text-sm text-muted-foreground max-w-[250]">
              You do not have permission to view this project, or it may not
              exist.
            </p>
          </div>
          <a
            href="/projects"
            className="mt-2 px-4 py-2 text-sm rounded-md bg-accent text-accent-foreground font-medium hover:opacity-90"
          >
            Back to Projects
          </a>
        </div>
      );
    }

    // 3. Handle General Failure (Fallback)
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 text-center min-h-[calc(100vh-64px)]">
        <p className="text-destructive font-medium">Failed to load project.</p>
        <Button
          variant="save"
          onClick={() => refetchProject()}
          className="text-accent text-sm hover:underline"
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="h-screen-[calc(100vh-64px] w-full max-w-300 mx-auto flex flex-col gap-5 p-6 items-stretch overflow-hidden bg-background">
        <div className="flex flex-col gap-1 w-full shrink-0">
          <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4">
            <div className="flex flex-row items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-foreground text-sm font-bold tracking-wider uppercase select-none">
                {getProjectInitials(project.name)}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
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

            {/* ⬇️ CLEANED UP: Merged duplicate nested flex wrapper divs into one clean action strip */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <OwnerOnly projectId={project.id}>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="text-sm rounded-full border border-input bg-card px-4 py-2 text-accent transition-all duration-200 cursor-pointer hover:bg-accent hover:text-card hover:border-white!"
                >
                  <div className="flex items-center gap-2">
                    <MoveUpRight className="h-4 w-4" />
                    <span>Invite</span>
                  </div>
                </button>

                {inviteModalOpen && (
                  <GenerateInviteModal
                    projectId={project.id}
                    onClose={() => setInviteModalOpen(false)}
                  />
                )}
              </OwnerOnly>
              <Button
                onClick={openCreateModal}
                variant="add"
                className="flex items-center"
              >
                <span className="sm:hidden">Task</span>
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-b border-border w-full">
            <ViewToggle />
            <div className="hidden text-xs text-muted-foreground sm:block">
              {activeView === "kanban"
                ? "Drag cards between columns to update status"
                : "Most recent changes first"}
            </div>
          </div>
        </div>
        {activeView === "kanban" ? (
          <KanbanBoard
            wipLimit={project.wipLimit}
            projectId={project.id}
            tasks={tasks}
          />
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
