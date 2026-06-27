"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "../../../../../lib/api";
import { Task, TaskStatus } from "../../../../types/types";
import KanbanBoard from "../../../../components/ui/KanbanBoard";
import BoardToggle from "../../../../components/ui/FloatingButton";
import ActivityLog from "../../../../components/ui/ActivityLog";
import { ChangeLog } from "../../../../types/types";

interface Project {
  id: number;
  name: string;
  description: string | null;
}

// const COLUMNS: { label: string; status: TaskStatus; color: string }[] = [
//   { label: "Todo", status: "Todo", color: "border-gray-500" },
//   { label: "In_Progress", status: "In_Progress", color: "border-yellow-500" },
//   { label: "Done", status: "Done", color: "border-cyan-500" },
// ];
type ActiveView = "kanban" | "activity" | "both";

export default function KanbanPage() {
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  //  Initialize the state with a function that checks localStorage
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("kanban_active_view");
      return (savedView as ActiveView) || "kanban";
    }
    return "kanban";
  });

  //  Save the view choice to localStorage whenever it changes
  const handleViewChange = (newView: ActiveView) => {
    setActiveView(newView);
    localStorage.setItem("kanban_active_view", newView);
  };

  const showKanban = activeView === "kanban" || activeView === "both";
  const showActivity = activeView === "activity" || activeView === "both";
  const isSplit = activeView === "both";

  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // 1. Separate function strictly for updating Tasks and Logs
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

      console.log(tasksRes.data);
      console.log(logsRes.data);
      setTasks(tasksRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error("Failed to refresh board data:", error);
    } finally {
      setLogsLoading(false);
    }
  }, [id]);

  // 2. Main initial bootloader effect
  useEffect(() => {
    if (!id) return;

    const fetchInitialProjectAndData = async () => {
      try {
        // Fetch everything on the very first page load
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
  // Only runs when the project ID in the URL changes!

  // const fetchBoard = useCallback(async () => {
  //   try {
  //     const [projectRes, tasksRes, logsRes] = await Promise.all([
  //       api.get("/test02/get_project", {
  //         params: { id },
  //       }),
  //       api.get("/test03/get_all_tasks_by_project", {
  //         params: { projectId: id },
  //       }),
  //       api.get("/test04/get_change_log_by_project", {
  //         params: { projectId: id },
  //       }),
  //     ]);
  //     setProject(projectRes.data);
  //     setTasks(tasksRes.data);
  //     setLogs(logsRes.data);
  //     // setLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //     setLogsLoading(false);
  //   }
  // }, [id]);

  // useEffect(() => {
  //   if (id) {
  //     fetchBoard();
  //   }
  // }, [fetchBoard]);

  return (
    <>
      <div className="h-full flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-white">
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* Card panels */}
            <div
              className={`flex gap-4 flex-1 overflow-hidden transition-all duration-300
            ${isSplit ? "flex-row" : "flex-col"}
          `}
            >
              {showKanban && (
                <div
                  className={`flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all duration-300
                ${isSplit ? "flex-1" : "flex-1"}
              `}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="7" height="18" rx="1" />
                      <rect x="14" y="3" width="7" height="11" rx="1" />
                    </svg>
                    <span className="text-sm font-semibold text-white">
                      Board
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto p-3">
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

              <BoardToggle active={activeView} onChange={handleViewChange} />

              {showActivity && (
                <div
                  className={`flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-all duration-300
                ${isSplit ? "w-80 flex-shrink-0" : "flex-1"}
              `}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">
                      Activity Log
                    </span>
                  </div>
                  <div className="flex-1 overflow-auto p-3">
                    <ActivityLog logs={logs} loading={logsLoading} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
