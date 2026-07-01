"use client";

import { useState } from "react";
import { useWip } from "../../context/WipContext";

export function WipControl({ inProgressCount }: { inProgressCount: number }) {
  const { wipLimit, setWipLimit } = useWip();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(wipLimit ?? ""));

  const isExceeded = wipLimit !== null && inProgressCount > wipLimit;
  const isAtLimit = wipLimit !== null && inProgressCount === wipLimit;

  function handleSave() {
    const parsed = parseInt(input);
    setWipLimit(!isNaN(parsed) && parsed > 0 ? parsed : null);
    setEditing(false);
  }

  return (
    // Added justify-center to keep the entire block centered in its parent
    <div className="flex items-center justify-center gap-1.5 ">
      {editing ? (
        // Added h-full and items-center to make sure input, buttons, and badge align perfectly
        <div className="flex items-center justify-center gap-1.5">
          <input
            placeholder="WIP"
            type="number"
            min={1}
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
              setWipLimit(null);
              setEditing(false);
            }}
            className="text-[10px] text-muted-foreground hover:text-foreground leading-none"
          >
            Clear
          </button>
        </div>
      ) : (
        // Changed button to an inline-flex box so text and badge line up center horizontally
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
        {inProgressCount}/{wipLimit ?? 0}
      </span>
    </div>
  );
}
