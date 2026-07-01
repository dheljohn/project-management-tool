// import React, { useState } from "react";
// import Draggable from "../DND/Draggable";
// import { Task } from "../../types/types";

// interface TaskCardProps {
//   task: Task;
//   onClick: (task: Task) => void;
// }

// export function TaskCard({ task, onClick }: TaskCardProps) {
//   return (
//     <Draggable id={String(task.id)}>
//       <div
//         className="bg-card border border-border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer group w-full text-left"
//         onClick={() => {
//           console.log("Task clicked");
//           onClick(task);
//         }}
//       >
//         <div className="flex items-center justify-between">
//           <p className="text-foreground text-sm font-medium group-hover:text-accent transition-colors">
//             {task.title}
//           </p>
//         </div>

//         {task.description && (
//           <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">
//             {task.description}
//           </p>
//         )}

//         <div className="mt-3 flex items-center justify-between">
//           <span className="text-xs text-muted-foreground">#{task.id}</span>
//           <span className="text-xs text-muted-foreground">
//             {new Date(task.updatedAt).toLocaleDateString("en-PH", {
//               month: "short",
//               day: "numeric",
//             })}
//           </span>
//         </div>
//       </div>
//     </Draggable>
//   );
// }
