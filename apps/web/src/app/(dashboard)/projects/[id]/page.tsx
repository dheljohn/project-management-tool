"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ViewProvider, useView } from "../../../../context/ViewContext";
import { useBreadcrumbs } from "../../../../context/BreadcrumbContext";
import { useProject } from "../../../../features/projects/hooks/useProject";
import { useProjectTasks } from "../../../../features/projects/hooks/useProjectTasks";
import { useChangeLogs } from "../../../../features/logs/hooks/useChangeLogs";
import KanbanBoard from "../../../../features/tasks/components/KanbanBoard";
import ActivityLog from "../../../../components/ui/ActivityLog";
import BoardToggle from "../../../../components/ui/FloatingButton";
import { WipProvider } from "../../../../context/WipContext";

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

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks = [] } = useProjectTasks(projectId);
  const { data: logs = [], isLoading: logsLoading } = useChangeLogs(projectId);

  const { activeView, isSplit } = useView();
  const { setBreadcrumbs } = useBreadcrumbs();

  const showKanban = activeView === "kanban" || activeView === "both";
  const showActivity = activeView === "activity" || activeView === "both";

  useEffect(() => {
    if (!project) return;
    setBreadcrumbs([
      { label: "Projects", href: "/projects" },
      { label: project.name },
    ]);
  }, [project, setBreadcrumbs]);

  if (projectLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isSplit ? "p-6" : "p-0"}`}>
      <div
        className={`flex gap-4 flex-1 overflow-hidden transition-all duration-300 mx-auto min-w-[1400px] ${isSplit ? "flex-row" : "flex-col"}`}
      >
        {showKanban && (
          <div
            className={`flex flex-col overflow-hidden border border-border bg-card ${isSplit ? "mb-2.5 rounded-xl flex-1" : "mb-0 rounded-none flex-1"}`}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="11" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="text-sm font-semibold text-foreground">
                Board
              </span>
            </div>
            <div className="flex-1 overflow-auto p-6 w-full max-w-6xl mx-auto bg-card">
              <KanbanBoard
                project={project!}
                projectId={projectId}
                tasks={tasks}
              />
            </div>
          </div>
        )}

        <BoardToggle />

        {showActivity && (
          <div
            className={`flex flex-col overflow-hidden border border-border ${isSplit ? "mb-2.5 rounded-xl w-80 shrink-0" : "mb-0 rounded-none flex-1"}`}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span className="text-sm font-semibold text-foreground">
                Activity Log
              </span>
            </div>
            <div
              className={`flex-1 overflow-auto px-3 w-full max-w-4xl mx-auto bg-card ${isSplit ? "mb-0 rounded-none" : "mb-20 rounded-b-4xl"}`}
            >
              <ActivityLog logs={logs} loading={logsLoading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
