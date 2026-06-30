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
