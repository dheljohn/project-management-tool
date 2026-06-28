"use client";

import { ChangeLog } from "../../types/types";
import { ActivityLogProps } from "../../types/types";

function formatLog(log: ChangeLog): string {
  const who = log.member?.user_id ?? "Someone";

  switch (log.field) {
    case "task creation":
      return `${who} created this task`;

    case "status":
      return `${who} moved this task from "${log.oldValue}" to "${log.newValue}"`;

    case "title":
      return `${who} renamed the task to "${log.newValue}"`;

    case "description":
      return `${who} updated the description`;

    default:
      return `${who} changed ${log.field} from "${log.oldValue}" to "${log.newValue}"`;
  }
}

export default function ActivityLog({ logs, loading }: ActivityLogProps) {
  if (loading)
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (logs.length === 0)
    return <p className="text-muted-foreground text-sm">No activity yet.</p>;

  return (
    <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto ">
      {logs.map((log) => {
        const isCreationLog = log.field === "task creation";

        return (
          <div
            key={log.id}
            className={`flex flex-col gap-2 border-l-2 pl-3 ${
              isCreationLog
                ? "border-status-done/50" // green-ish from your token
                : "border-accent/30" // cyan accent
            }`}
          >
            {/* ── Task title + timestamp ── */}
            <div className="flex items-center justify-between">
              <span className="text-foreground text-lg font-medium">
                #{log.task?.id ?? log.id} {log.task?.title ?? "Unknown Task"}
              </span>
              <span className="text-muted-foreground text-xs">
                {new Date(log.createdAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* ── Log message ── */}
            {isCreationLog ? (
              <p className="text-status-done text-sm font-medium">
                👤 {formatLog(log)}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">{formatLog(log)}</p>
            )}

            {/* ── Remark ── */}
            {log.remark && (
              <p className="text-muted-foreground text-xs italic bg-muted/40 p-1.5 rounded border border-border mt-0.5 ">
                Note: "{log.remark}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
