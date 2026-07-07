"use client";
import { useProjectMembers } from "../../features/tasks/hooks/useProjectMembers";
import { Crown } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(/[\s_]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Deterministic accent-tinted color per member, so avatars aren't all identical
const AVATAR_TINTS = [
  "bg-accent/15 text-accent",
  "bg-status-progress/15 text-status-progress",
  "bg-status-done/15 text-status-done",
  "bg-status-todo/15 text-status-todo",
];

function tintFor(id: number) {
  return AVATAR_TINTS[id % AVATAR_TINTS.length];
}

function OwnerCard({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl  p-4 ">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-semibold uppercase select-none">
        {getInitials(displayName)}
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground ring-2 ring-card">
          <Crown className="h-3 w-3" strokeWidth={2.5} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {displayName}
          </p>
          <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
            Owner
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{email}</p>
      </div>
    </div>
  );
}

function MemberRow({
  displayName,
  email,
  tintId,
}: {
  displayName: string;
  email: string;
  tintId: number;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg  transition-colors">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase select-none ${tintFor(
          tintId,
        )}`}
      >
        {getInitials(displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
    </div>
  );
}

function MembersListSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 animate-pulse">
      <div className="h-[76px] rounded-xl bg-muted" />
      <div className="h-4 w-24 rounded bg-muted mt-6" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[60px] rounded-lg bg-muted/70" />
      ))}
    </div>
  );
}

export default function MembersList({ projectId }: { projectId: number }) {
  const { data: members = [], isLoading } = useProjectMembers(projectId);

  if (isLoading) return <MembersListSkeleton />;

  const owner = members.find((m) => m.role === "OWNER");
  const others = members.filter((m) => m.role !== "OWNER");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-1">
      {owner && (
        <OwnerCard
          displayName={owner.member.username ?? owner.member.user_id}
          email={owner.member.email}
        />
      )}

      {others.length > 0 ? (
        <>
          <div className="flex items-center gap-2 pt-6 pb-1 px-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Members
            </span>
            <span className="text-xs text-muted-foreground/60">
              {others.length}
            </span>
          </div>
          <div className="divide-y divide-border/60">
            {others.map((m) => (
              <MemberRow
                key={m.id}
                displayName={m.member.username ?? m.member.user_id}
                email={m.member.email}
                tintId={m.member.id}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center pt-8">
          No other members yet — invite someone to collaborate.
        </p>
      )}
    </div>
  );
}
