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
      className="transition-all duration-100 ease-out hover:-translate-y-1 hover:shadow-md shadow-xs rounded-lg"
      style={{
        display: "block",
        width: "100%",
        opacity: isDragging ? 0.4 : 1,
        rotate: isDragging ? "2deg" : "0deg",
      }}
    >
      {children}
    </div>
  );
}
