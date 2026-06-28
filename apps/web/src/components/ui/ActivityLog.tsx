"use client";

import { ChangeLog } from "../../types/types";

interface ActivityLogProps {
  logs: ChangeLog[];
  loading: boolean;
}

function formatLog(log: ChangeLog): string {
  const who = log.member?.user_id ?? "Someone";

  if (log.field === "task creation") return `${who} created this task`;
  if (log.field === "status")
    return `${who} moved this card from ${log.oldValue} to ${log.newValue}`;
  if (log.field === "title")
    return `${who} renamed this task to "${log.newValue}"`;
  if (log.field === "description") return `${who} updated the description`;

  return `${who} changed ${log.field} from "${log.oldValue}" to "${log.newValue}"`;
}

export default function ActivityLog({ logs, loading }: ActivityLogProps) {
  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (logs.length === 0)
    return <p className="text-gray-500 text-sm">No activity yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {logs.map((log) => {
        const isCreationLog = log.field === "task creation";

        return (
          <div
            key={log.id}
            // Switch the border color to green for new tasks, cyan for updates
            className={`flex flex-col gap-1 border-l-2 pl-3 ${
              isCreationLog ? "border-emerald-500/50" : "border-cyan-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium">
                #{log.task?.id ?? log.id} {log.task?.title ?? "Unknown Task"}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(log.createdAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* 2. Custom Layout Generation Logic */}
            {isCreationLog ? (
              <p className="text-emerald-400 text-xs font-medium">
                {/* 👤 {log.member?.user_id ?? "Someone"} added a new task! */}
                👤 {formatLog(log)}
              </p>
            ) : (
              <p className="text-gray-400 text-xs">
                {/* <span className="text-gray-500 capitalize">{log.field}</span>{" "}
                changed from{" "}
                <span className="text-red-400 font-mono">
                  {log.oldValue || "—"}
                </span>
                {" → "}
                <span className="text-cyan-400 font-mono">
                  {log.newValue || "—"}
                </span> */}
                {formatLog(log)}
              </p>
            )}

            {log.remark && (
              <p className="text-gray-500 text-xs italic bg-gray-900/40 p-1.5 rounded border border-gray-800 mt-0.5">
                Note: "{log.remark}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
