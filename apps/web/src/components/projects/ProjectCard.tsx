// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import api from "../../../lib/api";

// export interface Project {
//   id: number;
//   name: string;
//   description: string | null;
//   ownerId: number;
//   createdAt: string;
//   updatedAt: string;
// }

// interface TaskCounts {
//   todo: number;
//   inProgress: number;
//   done: number;
//   total: number;
// }

// interface ProjectCardProps {
//   project: Project;
//   onEdit: (project: Project) => void;
// }

// export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
//   const router = useRouter();
//   const [counts, setCounts] = useState<TaskCounts | null>(null);

//   useEffect(() => {
//     api
//       .get("/test03/get_all_tasks_by_project", {
//         params: { projectId: project.id },
//       })
//       .then((res) => {
//         const tasks = res.data as { status: string }[];
//         setCounts({
//           todo: tasks.filter((t) => t.status === "Todo").length,
//           inProgress: tasks.filter((t) => t.status === "In_Progress").length,
//           done: tasks.filter((t) => t.status === "Done").length,
//           total: tasks.length,
//         });
//       })
//       .catch(() => setCounts({ todo: 0, inProgress: 0, done: 0, total: 0 }));
//   }, [project.id]);

//   const donePercent =
//     counts && counts.total > 0
//       ? Math.round((counts.done / counts.total) * 100)
//       : 0;

//   const isComplete = (counts?.total ?? 0) > 0 && donePercent === 100;
//   // const isComplete = counts?.total > 0 && donePercent === 100;

//   return (
//     <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent transition-all duration-200 group hover:shadow-lift flex flex-col relative">
//       {/*  Body  */}
//       <div
//         onClick={() => router.push(`/projects/${project.id}`)}
//         className="cursor-pointer p-5 flex flex-col gap-3 flex-1"
//       >
//         {/* Name + Edit */}
//         <div className="flex items-start justify-between gap-3">
//           <h2
//             className="text-foreground font-semibold text-base leading-snug
//                          group-hover:text-accent transition-colors line-clamp-1 flex-1"
//           >
//             {project.name}
//           </h2>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onEdit(project);
//             }}
//             className="shrink-0 text-muted-foreground hover:text-accent text-xs
//                        px-2 py-1 rounded-md border border-border hover:border-accent
//                        transition-colors"
//           >
//             Edit
//           </button>
//         </div>

//         {/* Description */}
//         <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 min-h-[2rem]">
//           {project.description ?? "No description provided."}
//         </p>

//         <div className="flex items-center gap-4 text-xs text-muted-foreground">
//           <span>
//             <span className="font-mono text-foreground">{counts?.total}</span>{" "}
//             tasks
//           </span>
//           <span className="h-3 w-px bg-border" />
//           <span>
//             <span className="font-mono text-foreground">
//               {counts?.inProgress}
//             </span>{" "}
//             in progress
//           </span>
//           {/* <span className="h-3 w-px bg-border" />
//           <span>Updated {project.updatedAt.split("T")[0]}</span> */}
//         </div>

//         {/*  Progress bar  */}
//         <div className="flex flex-col gap-1.5">
//           <div className="flex items-center justify-between">
//             <span className="text-xs text-muted-foreground">Progress</span>
//             <span
//               className={`text-xs font-semibold tabular-nums transition-colors
//       ${isComplete ? "text-status-done" : "text-foreground"}`}
//             >
//               {counts ? `${donePercent}%` : "—"}
//             </span>
//           </div>

//           <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-0.5">
//             {counts === null ? (
//               <div className="h-full w-1/3 rounded-full bg-border animate-pulse" />
//             ) : (
//               <>
//                 {counts.done > 0 && (
//                   <div
//                     className="h-full bg-status-done transition-all duration-700"
//                     style={{ width: `${(counts.done / counts.total) * 100}%` }}
//                   />
//                 )}
//                 {counts.inProgress > 0 && (
//                   <div
//                     className="h-full bg-status-progress transition-all duration-700"
//                     style={{
//                       width: `${(counts.inProgress / counts.total) * 100}%`,
//                     }}
//                   />
//                 )}
//                 {counts.todo > 0 && (
//                   <div
//                     className="h-full bg-status-todo transition-all duration-700"
//                     style={{ width: `${(counts.todo / counts.total) * 100}%` }}
//                   />
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/*  Footer  */}
//       <div className="px-5 py-3 border-t border-border flex items-center justify-between">
//         <span className="text-xs text-muted-foreground">
//           Updated{" "}
//           {new Date(project.updatedAt).toLocaleDateString("en-PH", {
//             month: "short",
//             day: "numeric",
//             year: "numeric",
//           })}
//         </span>

//         {isComplete && (
//           <span className="text-xs font-medium text-status-done flex items-center gap-1">
//             <svg
//               width="11"
//               height="11"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//             >
//               <path d="M20 6 9 17l-5-5" />
//             </svg>
//             Complete
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }
