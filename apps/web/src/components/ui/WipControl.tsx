"use client";

import { useState } from "react";
import { useProjectMutation } from "../../features/projects/hooks/useProjectMutation";
// import { Project } from "../../types/types";

export function WipControl({
  projectId,
  wipLimit,
  inProgressCount,
}: {
  projectId: number;
  wipLimit: number | null;
  inProgressCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(wipLimit ?? ""));

  const { mutate: saveWipLimit } = useProjectMutation({
    mode: "edit",
    projectId,
    onSuccess: () => {}, // cache already updated via invalidateQueries in the hook
  });

  const isExceeded = wipLimit !== null && inProgressCount > wipLimit;
  const isAtLimit = wipLimit !== null && inProgressCount === wipLimit;

  function handleSave() {
    const trimmed = input.trim();
    const parsed = parseInt(trimmed, 10);
    const isValidLimit = trimmed !== "" && !isNaN(parsed) && parsed > 0;
    saveWipLimit({ wipLimit: isValidLimit ? parsed : null });
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {editing ? (
        <div className="flex items-center justify-center gap-1.5">
          <input
            placeholder="WIP"
            type="number"
            min={0}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            className="w-12 text-xs bg-muted border border-accent rounded px-1.5 py-0.5 text-foreground focus:outline-none"
          />
          <button
            onClick={handleSave}
            className="text-[10px] text-accent hover:underline leading-none"
          >
            Set
          </button>
          <button
            onClick={() => {
              saveWipLimit({ wipLimit: null });
              setEditing(false);
            }}
            className="text-[10px] text-muted-foreground hover:text-foreground leading-none"
          >
            Clear
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setInput(String(wipLimit ?? ""));
            setEditing(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:text-accent transition-colors"
        >
          <span>{wipLimit ? "WIP" : "Edit WIP"}</span>
        </button>
      )}
      <span
        className={`text-xs font-mono px-1.5 py-0.5 rounded-full border inline-flex items-center justify-center ${
          isExceeded
            ? "text-destructive bg-destructive/10 border-destructive/30"
            : isAtLimit
              ? "text-orange-400 bg-orange-400/10 border-orange-400/30"
              : "text-muted-foreground bg-muted border-border"
        }`}
      >
        {inProgressCount}/{wipLimit ?? "∞"}
      </span>
    </div>
  );
}
