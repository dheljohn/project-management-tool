"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "../../../../../lib/api";
import { Task } from "../../../../types/types";
import KanbanBoard from "../../../../components/ui/KanbanBoard";
import BoardToggle from "../../../../components/ui/FloatingButton";
import ActivityLog from "../../../../components/ui/ActivityLog";
import { ChangeLog } from "../../../../types/types";
import { useBreadcrumbs } from "../../../../context/BreadcrumbContext";

import { ViewProvider, useView } from "../../../../context/ViewContext";

interface Project {
  id: number;
  name: string;
  description: string | null;
}

export default function KanbanPage() {
  return (
    <ViewProvider>
      <KanbanPageContent />
    </ViewProvider>
  );
}

function KanbanPageContent() {
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const { setBreadcrumbs } = useBreadcrumbs();

  const { activeView, isSplit } = useView();

  const showKanban = activeView === "kanban" || activeView === "both";
  const showActivity = activeView === "activity" || activeView === "both";

  useEffect(() => {
    if (!project) return;
    setBreadcrumbs([
      { label: "Projects", href: "/projects" },
      { label: project.name },
    ]);
  }, [project, setBreadcrumbs]);

  const refreshBoardData = useCallback(async () => {
    if (!id) return;
    try {
      const [tasksRes, logsRes] = await Promise.all([
        api.get("/test03/get_all_tasks_by_project", {
          params: { projectId: id },
        }),
        api.get("/test04/get_change_log_by_project", {
          params: { projectId: id },
        }),
      ]);
      setTasks(tasksRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error("Failed to refresh board data:", error);
    } finally {
      setLogsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchInitialProjectAndData = async () => {
      try {
        const [projectRes, tasksRes, logsRes] = await Promise.all([
          api.get("/test02/get_project", { params: { id } }),
          api.get("/test03/get_all_tasks_by_project", {
            params: { projectId: id },
          }),
          api.get("/test04/get_change_log_by_project", {
            params: { projectId: id },
          }),
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error("Initial load failed:", error);
      } finally {
        setLoading(false);
        setLogsLoading(false);
      }
    };
    fetchInitialProjectAndData();
  }, [id]);

  return (
    <div className={`h-full flex flex-col  ${isSplit ? "p-6" : "p-0"}`}>
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading dashboard...
        </div>
      ) : (
        <div
          className={`flex gap-4 flex-1 overflow-hidden transition-all duration-300 mx-auto  min-w-[1400px] 
          ${isSplit ? "flex-row" : "flex-col"}`}
        >
          {/* ── Kanban Panel ── */}
          {showKanban && (
            <div
              className={`flex flex-col overflow-hidden border border-border bg-card
              ${isSplit ? "mb-2.5 rounded-xl flex-1" : "mb-0 rounded-none flex-1"}`}
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
                  projectId={Number(id)}
                  tasks={tasks}
                  setTasks={setTasks}
                  refreshBoard={refreshBoardData}
                />
              </div>
            </div>
          )}

          <BoardToggle />

          {/* ── Activity Log Panel ── */}
          {showActivity && (
            <div
              className={`flex flex-col overflow-hidden border border-border 
              ${isSplit ? "mb-2.5 rounded-xl w-80 shrink-0" : "mb-0 rounded-none flex-1"}`}
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
                className={`flex-1 overflow-auto px-3 w-full max-w-4xl mx-auto bg-card ${isSplit ? "mb-0 rounded-none " : "mb-20 rounded-b-4xl"}`}
              >
                <ActivityLog logs={logs} loading={logsLoading} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
