// "use client";

// import { useDraggable } from "@dnd-kit/react";
// import React from "react";

// interface DraggableProps {
//   id: string;
//   children: React.ReactNode;
// }

// export default function Draggable({ id, children }: DraggableProps) {
//   const draggable = useDraggable({
//     id: id,
//   });

//   return (
//     <button
//       ref={draggable.ref}
//       style={{
//         cursor: "grab",
//         display: "block",
//         padding: "8px",
//         margin: "4px 0",
//         border: "1px solid #ccc",
//         borderRadius: "4px",
//         width: "100%",
//         textAlign: "left",
//         background: draggable.isDragging ? "#e0f2fe" : "#fff", // 3. You can access utility states directly
//       }}
//     >
//       {children}
//     </button>
//   );
// }
"use client";

import { useDraggable } from "@dnd-kit/react";
import React from "react";

interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

export default function Draggable({ id, children }: DraggableProps) {
  const { ref, isDragging } = useDraggable({
    id: id,
  });

  return (
    <div
      ref={ref}
      style={{
        display: "block",
        width: "100%",
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {children}
    </div>
  );
}
