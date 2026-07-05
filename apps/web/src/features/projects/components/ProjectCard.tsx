"use client";

import { useRouter } from "next/navigation";
import { Project } from "../../../types/types";
import { useProjectTasks } from "../hooks/useProjectTasks";
import { Button } from "../../../components/ui/Button";
import { TruncatedText } from "../../../components/ui/TruncatedText";
import { getUserInitials } from "../../../app/utils/getUserInitials";
import { useProjectMembers } from "../../tasks/hooks/useProjectMembers";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

const MAX_VISIBLE_AVATARS = 3;

export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const router = useRouter();
  const { data: tasks } = useProjectTasks(project.id);
  const { data: members = [] } = useProjectMembers(project.id);

  const counts = tasks
    ? {
        todo: tasks.filter((t) => t.status === "Todo").length,
        inProgress: tasks.filter((t) => t.status === "In_Progress").length,
        done: tasks.filter((t) => t.status === "Done").length,
        total: tasks.length,
      }
    : null;

  const donePercent =
    counts && counts.total > 0
      ? Math.round((counts.done / counts.total) * 100)
      : 0;
  const isComplete = (counts?.total ?? 0) > 0 && donePercent === 100;
  const isEmpty = counts !== null && counts.total === 0;

  const visibleMembers = members.slice(0, MAX_VISIBLE_AVATARS);
  const extraCount = members.length - visibleMembers.length;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent transition-all duration-200 group hover:shadow-lift flex flex-col relative">
      {/* Status accent bar */}
      <div
        className={`h-1 w-full transition-colors ${
          isComplete
            ? "bg-status-done"
            : isEmpty
              ? "bg-border"
              : "bg-status-progress"
        }`}
      />

      <div
        onClick={() => router.push(`/projects/${project.id}`)}
        className="cursor-pointer p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 flex-1"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <h2 className="text-foreground font-semibold text-sm sm:text-base leading-snug group-hover:text-accent transition-colors line-clamp-1 flex-1 min-w-0">
            <TruncatedText text={project.name} maxLength={25} />
          </h2>
          <Button
            variant="xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="shrink-0 text-muted-foreground cursor-pointer hover:text-accent text-[11px] sm:text-xs p-0 hover:border-accent transition-colors"
          >
            Edit
          </Button>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed line-clamp-2 min-h-[1.75rem] sm:min-h-[2rem]">
          {project.description || "No description yet."}
        </p>

        {/* Task breakdown — task count | in progress | updated date, vertical dividers only */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground">
          <span>
            <span className="font-mono text-foreground">
              {counts?.total ?? "—"}
            </span>{" "}
            tasks
          </span>

          {counts !== null && counts.total > 0 && (
            <>
              <span className="h-3 w-px bg-border" />
              <span>
                <span className="font-mono text-foreground">
                  {counts.inProgress}
                </span>{" "}
                in progress
              </span>
            </>
          )}

          <span className="h-3 w-px bg-border" />
          <span className="whitespace-nowrap">
            Updated{" "}
            {new Date(project.updatedAt).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5 mt-auto pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-muted-foreground">
              Completion
            </span>
            <span
              className={`text-[11px] sm:text-xs font-semibold tabular-nums transition-colors ${
                isComplete ? "text-status-done" : "text-foreground"
              }`}
            >
              {counts ? `${donePercent}%` : "—"}
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex gap-0.5">
            {counts === null ? (
              <div className="h-full w-1/3 rounded-full bg-border animate-pulse" />
            ) : counts.total === 0 ? (
              <div className="h-full w-full rounded-full bg-border" />
            ) : (
              <>
                {counts.done > 0 && (
                  <div
                    className="h-full bg-status-done transition-all duration-700"
                    style={{ width: `${(counts.done / counts.total) * 100}%` }}
                  />
                )}
                {counts.inProgress > 0 && (
                  <div
                    className="h-full bg-status-progress transition-all duration-700"
                    style={{
                      width: `${(counts.inProgress / counts.total) * 100}%`,
                    }}
                  />
                )}
                {counts.todo > 0 && (
                  <div
                    className="h-full bg-status-todo transition-all duration-700"
                    style={{ width: `${(counts.todo / counts.total) * 100}%` }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer — member avatars on the left, Open/Complete on the right */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center -space-x-2">
          {visibleMembers.map((m) => (
            <div
              key={m.member.id}
              title={m.member.username ?? m.member.user_id}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-foreground text-[10px] font-semibold uppercase select-none ring-2 ring-card"
            >
              {getUserInitials(m.member.username ?? m.member.user_id)}
            </div>
          ))}
          {extraCount > 0 && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-border text-muted-foreground text-[10px] font-semibold select-none ring-2 ring-card">
              +{extraCount}
            </div>
          )}
        </div>

        {isComplete ? (
          <span className="text-[10px] sm:text-xs font-medium text-status-done flex items-center gap-1 shrink-0">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Complete
          </span>
        ) : (
          <span className="text-[10px] sm:text-xs font-medium text-accent flex items-center gap-1 shrink-0">
            Open
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}
