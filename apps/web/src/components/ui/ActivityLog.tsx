"use client";

import { ChangeLog, ActivityLogProps } from "../../types/types";
import { getUserInitials } from "../../app/utils/getUserInitials";

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (isSameDay(date, today)) return "TODAY";
  if (isSameDay(date, yesterday)) return "YESTERDAY";

  return date
    .toLocaleDateString("en-PH", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();
}

function formatStatus(val: string | null | undefined): string {
  if (!val) return "—";
  return val.replace(/_/g, " ");
}

function groupLogsByDay(
  logs: ChangeLog[],
): { dateKey: string; logs: ChangeLog[] }[] {
  const groups: { dateKey: string; logs: ChangeLog[] }[] = [];

  for (const log of logs) {
    const dateKey = new Date(log.createdAt).toDateString();
    const existing = groups.find((g) => g.dateKey === dateKey);
    if (existing) {
      existing.logs.push(log);
    } else {
      groups.push({ dateKey, logs: [log] });
    }
  }

  return groups;
}

function formatAction(log: ChangeLog): {
  actor: string;
  sentence: React.ReactNode;
  detail?: string;
} {
  const actor = log.member?.username ?? log.member?.user_id ?? "Someone";

  const taskTitle = log.taskTitle || `Task #${log.taskId}`;

  switch (log.field) {
    case "task creation":
      return {
        actor,
        sentence: (
          <>
            created{" "}
            <span className="font-semibold text-foreground">"{taskTitle}"</span>
          </>
        ),
      };

    case "status":
      return {
        actor,
        sentence: (
          <>
            moved{" "}
            <span className="font-semibold text-foreground">"{taskTitle}"</span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {formatStatus(log.newValue)}
            </span>
          </>
        ),
      };

    case "title":
      return {
        actor,
        sentence: (
          <>
            renamed a task to{" "}
            <span className="font-semibold text-foreground">
              "{log.newValue}"
            </span>
          </>
        ),
      };

    case "description":
      return {
        actor,
        sentence: (
          <>
            updated the description on{" "}
            <span className="font-semibold text-foreground">"{taskTitle}"</span>
          </>
        ),
        detail: log.newValue ?? undefined,
      };

    case "priority":
      return {
        actor,
        sentence: (
          <>
            changed priority on{" "}
            <span className="font-semibold text-foreground">"{taskTitle}"</span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {formatStatus(log.newValue)}
            </span>
          </>
        ),
      };
    case "assignees":
      return {
        actor,
        sentence: (
          <>
            updated assignees on{" "}
            <span className="font-semibold text-foreground">"{taskTitle}"</span>
          </>
        ),
      };

    default:
      return {
        actor,
        sentence: (
          <>
            changed {log.field} on{" "}
            <span className="font-semibold text-foreground">"{taskTitle}"</span>
          </>
        ),
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

  const groups = groupLogsByDay(logs);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.dateKey}>
          {/* Date divider */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <span className="text-xs font-semibold text-muted-foreground tracking-wide whitespace-nowrap">
              {group.logs[0] ? formatDateHeader(group.logs[0].createdAt) : ""}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <ol className="relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {group.logs.map((log) => {
              const { actor, sentence, detail } = formatAction(log);
              const isCreation = log.field === "task creation";

              return (
                <li key={log.id} className="relative flex gap-4 py-1.5">
                  {/* Avatar bubble */}
                  <span
                    className={`relative z-10 mt-1 grid h-8 w-8 shrink-0 place-items-center
                            rounded-full border text-[10px] font-bold
                            ${
                              isCreation
                                ? "border-status-done/40 bg-status-done/10 text-status-done"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                  >
                    {getUserInitials(actor)}
                  </span>

                  {/* Entry card */}
                  <div className="flex-1 rounded-xl border border-border bg-card p-4 min-w-0 mb-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-snug flex-1">
                        <span className="font-semibold text-foreground">
                          {actor}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {sentence}
                        </span>
                      </p>
                      <time
                        className="font-mono text-[11px] text-muted-foreground shrink-0 pt-0.5"
                        title={new Date(log.createdAt).toLocaleString("en-PH")}
                      >
                        {formatTime(log.createdAt)}
                      </time>
                    </div>

                    {detail && (
                      <p className="mt-2.5 rounded-md border-l-2 border-accent/60 bg-surface px-3 py-2 text-xs text-muted-foreground italic">
                        "{detail}"
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
