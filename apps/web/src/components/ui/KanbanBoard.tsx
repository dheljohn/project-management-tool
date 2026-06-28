"use client";

import { useState } from "react";
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
  setTasks,
  refreshBoard,
}: KanbanBoardProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  function getTasksByStatus(status: TaskStatus) {
    return tasks.filter((task) => task.status === status);
  }

  return (
    <DragDropProvider
      onDragEnd={async (event) => {
        if (event.canceled || !event.operation.source) return;

        const draggedId = event.operation.source.id;
        const rawTargetId = event.operation.target?.id;
        if (!rawTargetId) return;

        const targetStatus = String(rawTargetId).replace(
          /\s+/g,
          "_",
        ) as TaskStatus;
        const previousTasks = [...tasks];

        setTasks((prev) =>
          prev.map((task) =>
            String(task.id) === String(draggedId)
              ? { ...task, status: targetStatus }
              : task,
          ),
        );

        try {
          await api.patch("/test03/patch_task", {
            task_id: Number(draggedId),
            status:
              targetStatus === "In_Progress" ? "In Progress" : targetStatus,
            user_id: localStorage.getItem("user_id"),
          });
          refreshBoard();
        } catch (err) {
          console.error("[DnD] PATCH failed:", err);
          setTasks(previousTasks);
        }
      }}
    >
      <div className="h-full flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {/* <button
              onClick={() => router.push(`/projects/${projectId}/changelog`)}
              className="border border-border text-foreground rounded-lg px-3 py-2 text-sm
                         hover:bg-muted transition-colors"
            >
              Changelog
            </button> */}

            <button
              onClick={() => setModalOpen(true)}
              className="bg-accent text-accent-foreground rounded-lg px-4 py-2 text-sm font-medium
                         hover:opacity-90 transition-opacity"
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* ── Columns ── */}
        <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.status}
              column={column}
              tasks={getTasksByStatus(column.status)}
            />
          ))}
        </div>

        {/* ── Modal ── */}
        {modalOpen && (
          <TaskModal
            projectId={projectId}
            onClose={() => setModalOpen(false)}
            onSuccess={(newTask) => {
              setTasks((prev) => [...prev, newTask]);
              void refreshBoard();
              setModalOpen(false);
            }}
          />
        )}
      </div>
    </DragDropProvider>
  );
}

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import api from "../../../lib/api";

// import TaskModal from "../../components/tasks/TaskModal";
// import { Task, TaskStatus } from "../../types/types";

// import { DragDropProvider } from "@dnd-kit/react";
// import { KanbanColumn } from "../tasks/KanbanColumn";

// interface Project {
//   id: number;
//   name: string;
//   description: string | null;
// }

// interface KanbanBoardProps {
//   project: Project;
//   projectId: number;
//   tasks: Task[];
//   setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
//   refreshBoard: () => Promise<void>;
// }

// const COLUMNS = [
//   { label: "Todo", status: "Todo", color: "border-status-todo" },
//   {
//     label: "In Progress",
//     status: "In_Progress",
//     color: "border-status-progress",
//   },
//   { label: "Done", status: "Done", color: "border-status-done" },
// ] satisfies { label: string; status: TaskStatus; color: string }[];

// export default function KanbanBoard({
//   project,
//   projectId,
//   tasks,
//   setTasks,
//   refreshBoard,
// }: KanbanBoardProps) {
//   const [modalOpen, setModalOpen] = useState(false);

//   function getTasksByStatus(status: TaskStatus) {
//     return tasks.filter((task) => task.status === status);
//   }

//   const todoCount = getTasksByStatus("Todo").length;
//   const inProgressCount = getTasksByStatus("In_Progress").length;
//   const doneCount = getTasksByStatus("Done").length;
//   const total = tasks.length;
//   const donePercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

//   return (
//     <DragDropProvider
//       onDragEnd={async (event) => {
//         if (event.canceled || !event.operation.source) return;

//         const draggedId = event.operation.source.id;
//         const rawTargetId = event.operation.target?.id;
//         if (!rawTargetId) return;

//         const targetStatus = String(rawTargetId).replace(
//           /\s+/g,
//           "_",
//         ) as TaskStatus;
//         const previousTasks = [...tasks];

//         setTasks((prev) =>
//           prev.map((task) =>
//             String(task.id) === String(draggedId)
//               ? { ...task, status: targetStatus }
//               : task,
//           ),
//         );

//         try {
//           await api.patch("/test03/patch_task", {
//             task_id: Number(draggedId),
//             status:
//               targetStatus === "In_Progress" ? "In Progress" : targetStatus,
//             user_id: localStorage.getItem("user_id"),
//           });
//           refreshBoard();
//         } catch (err) {
//           console.error("[DnD] PATCH failed:", err);
//           setTasks(previousTasks);
//         }
//       }}
//     >
//       <div className="h-full flex flex-col gap-5">
//         {/* ── Header ── */}
//         <div className="flex items-start justify-between gap-4">
//           {/* Left — project info */}
//           <div className="flex flex-col gap-1 min-w-0">
//             <div className="flex items-center gap-2">
//               <h1 className="text-xl font-bold text-foreground truncate">
//                 {project.name}
//               </h1>
//               {donePercent === 100 && (
//                 <span
//                   className="inline-flex items-center gap-1 text-xs font-medium
//                                  text-status-done bg-status-done/10 px-2 py-0.5 rounded-full"
//                 >
//                   <svg
//                     width="10"
//                     height="10"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="3"
//                   >
//                     <path d="M20 6 9 17l-5-5" />
//                   </svg>
//                   Complete
//                 </span>
//               )}
//             </div>
//             {project.description && (
//               <p className="text-xs text-muted-foreground line-clamp-1">
//                 {project.description}
//               </p>
//             )}
//           </div>

//           {/* Right — Add task */}
//           <button
//             onClick={() => setModalOpen(true)}
//             className="shrink-0 flex items-center gap-1.5 bg-accent hover:opacity-90
//                        text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg
//                        transition-opacity"
//           >
//             <svg
//               width="13"
//               height="13"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//             >
//               <path d="M12 5v14M5 12h14" />
//             </svg>
//             Add Task
//           </button>
//         </div>

//         {/* ── Progress bar + stats ── */}
//         {total > 0 && (
//           <div className="flex flex-col gap-2 bg-card border border-border rounded-xl px-4 py-3">
//             {/* Stat pills row */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
//                   <span className="w-2 h-2 rounded-full bg-status-todo" />
//                   {todoCount} Todo
//                 </span>
//                 <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
//                   <span className="w-2 h-2 rounded-full bg-status-progress" />
//                   {inProgressCount} In Progress
//                 </span>
//                 <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
//                   <span className="w-2 h-2 rounded-full bg-status-done" />
//                   {doneCount} Done
//                 </span>
//               </div>
//               <span
//                 className={`text-xs font-semibold tabular-nums
//                 ${donePercent === 100 ? "text-status-done" : "text-foreground"}`}
//               >
//                 {donePercent}% complete
//               </span>
//             </div>

//             {/* Segmented progress bar */}
//             <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-0.5">
//               {doneCount > 0 && (
//                 <div
//                   className="h-full bg-status-done rounded-full transition-all duration-500"
//                   style={{ width: `${(doneCount / total) * 100}%` }}
//                 />
//               )}
//               {inProgressCount > 0 && (
//                 <div
//                   className="h-full bg-status-progress rounded-full transition-all duration-500"
//                   style={{ width: `${(inProgressCount / total) * 100}%` }}
//                 />
//               )}
//               {todoCount > 0 && (
//                 <div
//                   className="h-full bg-status-todo rounded-full transition-all duration-500"
//                   style={{ width: `${(todoCount / total) * 100}%` }}
//                 />
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── Columns ── */}
//         <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
//           {COLUMNS.map((column) => (
//             <KanbanColumn
//               key={column.status}
//               column={column}
//               tasks={getTasksByStatus(column.status)}
//             />
//           ))}
//         </div>

//         {/* ── Modal ── */}
//         {modalOpen && (
//           <TaskModal
//             projectId={projectId}
//             onClose={() => setModalOpen(false)}
//             onSuccess={(newTask) => {
//               setTasks((prev) => [...prev, newTask]);
//               void refreshBoard();
//               setModalOpen(false);
//             }}
//           />
//         )}
//       </div>
//     </DragDropProvider>
//   );
// }
