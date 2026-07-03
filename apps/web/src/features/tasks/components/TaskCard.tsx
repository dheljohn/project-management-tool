// import React, { useEffect, useRef, useState } from "react";
// import Draggable from "../../../components/DND/Draggable";
// import { Task } from "../../../types/types";
// import { PriorityBadge } from "../../../components/ui/PriorityBadge";
// import { PRIORITY_CONFIG } from "../../../../lib/priority";

// interface TaskCardProps {
//   task: Task;
//   onClick: (task: Task) => void;
//   isJustCompleted?: boolean;
// }

// export function TaskCard({ task, onClick }: TaskCardProps) {
//   const config = PRIORITY_CONFIG[task.priority];
//   const isInDone = task.status === "Done";
//   // const prevStatusRef = useRef(task.status);
//   // const [justCompleted, setJustCompleted] = useState(false);

//   // useEffect(() => {
//   //   if (prevStatusRef.current !== "Done" && task.status === "Done") {
//   //     setJustCompleted(true);
//   //     const timeout = setTimeout(() => setJustCompleted(false), 900);
//   //     return () => clearTimeout(timeout);
//   //   }
//   //   prevStatusRef.current = task.status;
//   // }, [task.status]);

//   return (
//     <Draggable id={String(task.id)}>
//       <div
//         className={`bg-card border ${config.border} border-l-2 rounded-lg p-4 hover:border-accent transition-colors cursor-pointer group w-full text-left ${
//           isJustCompleted ? "animate-task-complete" : ""
//         }`}
//         onClick={() => onClick(task)}
//       >
//         <div className="flex items-start justify-between gap-2">
//           <p
//             className={`text-foreground  text-sm font-medium group-hover:text-accent transition-colors flex-1 ${isInDone ? "line-through" : ""}`}
//           >
//             {task.title}
//           </p>
//           <PriorityBadge priority={task.priority} />
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
import React from "react";
import Draggable from "../../../components/DND/Draggable";
import { Task } from "../../../types/types";
import { PriorityBadge } from "../../../components/ui/PriorityBadge";
import { PRIORITY_CONFIG } from "../../../../lib/priority";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  isJustCompleted?: boolean;
}

export function TaskCard({ task, onClick, isJustCompleted }: TaskCardProps) {
  const config = PRIORITY_CONFIG[task.priority];
  const isInDone = task.status === "Done";

  return (
    <Draggable id={String(task.id)}>
      <div
        className={`
          bg-card border  border-l-2 rounded-lg p-4  transition-colors cursor-grab group w-full text-left 
          ${isJustCompleted ? "animate-task-complete opacity-50 cursor-default pointer-events-none border-2 border-destructive/40 rounded-xl " : " "} `}
        onClick={() => onClick(task)}
      >
        {/* <div
  className={`border border-l-2 p-4 transition-colors w-full text-left group rounded-lg
    ${isInDone 
      ? "bg-muted/40 border-muted opacity-60 cursor-default pointer-events-none" 
      : `bg-card ${config.border} cursor-pointer hover:border-accent`
    }
    ${isJustCompleted ? "animate-task-complete" : ""}`}
  // Prevent the click action from firing if the task is done
  onClick={() => !isInDone && onClick(task)}
> */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-foreground text-sm font-medium group-hover:text-accent transition-colors flex-1 ${isInDone ? "line-through  opacity-50" : " "}
              `}
          >
            {task.title}
          </p>
          <PriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="text-muted-foreground text-xs mt-1.5 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">#{task.id}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(task.updatedAt).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Draggable>
  );
}
