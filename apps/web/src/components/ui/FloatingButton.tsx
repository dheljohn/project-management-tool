"use client";

// Grab your radio station hook
import { useView } from "../../context/ViewContext";

export default function BoardToggle() {
  // Connect directly to the radio station state
  const { activeView, setActiveView } = useView();

  // Updated toggle function to talk directly to the radio station!
  function toggle(view: "kanban" | "activity") {
    if (activeView === "both") {
      setActiveView(view === "kanban" ? "activity" : "kanban");
    } else if (activeView === view) {
      return;
    } else {
      setActiveView("both");
    }
  }

  //  Use activeView from the context to check what's turned on
  const kanbanOn = activeView === "kanban" || activeView === "both";
  const activityOn = activeView === "activity" || activeView === "both";

  return (
    <div className="flex items-center gap-1 bg-surface border border-border rounded-xl px-2 py-1.5 fixed bottom-5 left-1/2 -translate-x-1/2 z-50 shadow-lift shadow-accent/10">
      <button
        type="button"
        onClick={() => toggle("kanban")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative
          ${
            kanbanOn
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="18" rx="1" />
          <rect x="14" y="3" width="7" height="11" rx="1" />
        </svg>
        Board
        {kanbanOn && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
        )}
      </button>

      {/*  Divider  */}
      <div className="w-px h-5 bg-border mx-1" />

      <button
        type="button"
        onClick={() => toggle("activity")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative
          ${
            activityOn
              ? "bg-accent/10 text-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        Activity
        {activityOn && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
        )}
      </button>
    </div>
  );
}
