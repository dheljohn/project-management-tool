// "use client";

// import { useDroppable } from "@dnd-kit/react";
// import React from "react";

// interface DroppableProps {
//   id: string;
//   children: React.ReactNode;
// }

// export default function Droppable({ id, children }: DroppableProps) {
//   // The hook returns a configuration object containing the metadata and refs
//   const droppable = useDroppable({
//     id: id,
//   });

//   return (
//     <div
//       ref={droppable.ref}
//       style={{
//         width: 300,
//         minHeight: 400,
//         padding: "16px",
//         borderRadius: "8px",
//         background: droppable.isDropTarget ? "#e2e8f0" : "#f1f5f9", // Highlights column when dragging over it
//         transition: "background-color 0.2s ease",
//         display: "flex",
//         flexDirection: "column",
//         gap: "12px",
//       }}
//     >
//       {children}
//     </div>
//   );
// }
import React from "react";
import { useDroppable } from "@dnd-kit/react";

interface DroppableState {
  isDropTarget: boolean;
}

interface DroppableProps {
  id: string;
  children: React.ReactNode | ((state: DroppableState) => React.ReactNode);
}

export default function Droppable({ id, children }: DroppableProps) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div ref={ref} className="flex flex-col flex-1 min-h-0">
      {typeof children === "function" ? children({ isDropTarget }) : children}
    </div>
  );
}
