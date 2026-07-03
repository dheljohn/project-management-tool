"use client";

import { ChangeLog, ActivityLogProps } from "../../types/types";

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function formatStatus(val: string | null | undefined): string {
  if (!val) return "—";
  return val.replace(/_/g, " ");
}

function formatAction(log: ChangeLog): {
  actor: string;
  action: string;
  target: string;
  detail?: string;
} {
  const actor = log.member?.user_id ?? "Someone";
  // Use id only — never the live title join
  const taskRef = `Task #${log.task?.id ?? log.id}`;

  switch (log.field) {
    case "task creation":
      return {
        actor,
        action: "created",
        target: log.newValue ?? taskRef, // newValue now holds the title snapshot
      };

    case "status":
      return {
        actor,
        action: "moved",
        target: taskRef,
        detail: `${formatStatus(log.oldValue)} → ${formatStatus(log.newValue)}`,
      };

    case "title":
      return {
        actor,
        action: "renamed task to",
        target: log.newValue ?? taskRef, // newValue is the new title
      };

    case "description":
      return {
        actor,
        action: "updated description on",
        target: taskRef,
        detail: log.newValue ?? undefined,
      };
    case "priority":
      return {
        actor,
        action: "changed priority to",
        target: taskRef,
        detail: `${formatStatus(log.oldValue)} → ${formatStatus(log.newValue)}`,
      };
    default:
      return {
        actor,
        action: `changed ${log.field} on`,
        target: taskRef,
        detail: `${log.oldValue ?? "—"} → ${log.newValue ?? "—"}`,
      };
  }
}

export default function ActivityLog({ logs, loading }: ActivityLogProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto ">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0 mt-1" />
            <div className="flex-1 rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-muted-foreground"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">No activity yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Actions on tasks will show up here.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative w-full max-w-2xl mx-auto before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
      {logs.map((log) => {
        const { actor, action, target, detail } = formatAction(log);
        const isCreation = log.field === "task creation";

        return (
          <li key={log.id} className="relative flex gap-4 py-3">
            {/*  Avatar bubble  */}
            <span
              className={`relative z-10 mt-1 grid h-8 w-8 shrink-0 place-items-center
                      rounded-full border text-[10px] font-bold
                      ${
                        isCreation
                          ? "border-status-done/40 bg-status-done/10 text-status-done"
                          : "border-border bg-background text-muted-foreground"
                      }`}
            >
              {getInitials(actor)}
            </span>

            {/*  Entry card  */}
            <div className="flex-1 rounded-xl border border-border bg-card p-4 min-w-0">
              {/* Top row: message + timestamp */}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm leading-snug">
                  <span className="font-semibold text-foreground">{actor}</span>{" "}
                  <span className="text-muted-foreground">{action}</span>{" "}
                  <span
                    className={`font-medium ${
                      isCreation ? "text-status-done" : "text-foreground"
                    }`}
                  >
                    {target}
                  </span>
                </p>
                <time
                  className="font-mono text-[11px] text-muted-foreground shrink-0"
                  title={new Date(log.createdAt).toLocaleString("en-PH")}
                >
                  {formatRelative(log.createdAt)}
                </time>
              </div>

              {/* Task reference pill */}
              {log.task && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  on{" "}
                  <span className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                    #{log.task.id}
                  </span>
                </p>
              )}

              {/* Detail / remark block */}
              {(detail || log.remark) && (
                <p
                  className="mt-2.5 rounded-md border-l-2 border-accent/60
                          bg-surface px-3 py-2 text-xs text-muted-foreground italic"
                >
                  "{log.remark || detail}"
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
