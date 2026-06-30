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
