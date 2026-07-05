"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinProjectSchema, JoinProjectInput } from "../schemas/invite.schema";
import { useJoinProject } from "../hooks/useInvites";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function JoinProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 border border-input bg-background hover:bg-muted text-foreground text-sm font-medium px-4 py-2 rounded-full cursor-pointer transition-colors duration-200 ease-in-out"
      >
        <div className="flex items-center">
          <LogIn className="mr-2 h-4 w-4" />
          <span className="flex sm:hidden"> Join</span>
          <span className="hidden sm:flex"> Join Project</span>
        </div>
      </button>

      {isOpen && <JoinProjectModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

function JoinProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinProjectInput>({
    resolver: zodResolver(joinProjectSchema),
  });

  const joinProject = useJoinProject();

  const onSubmit = (data: JoinProjectInput) => {
    joinProject.mutate(data.code, {
      onSuccess: (res) => {
        reset();
        onClose();
        router.push(`/projects/${res.project.id}`);
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] "
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full sm:max-w-sm
          rounded-t-2xl sm:rounded-xl
          p-5 sm:p-6
          shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-foreground text-base sm:text-lg font-semibold mb-4">
          Join a project
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1">
          <div className="flex items-center w-full rounded-full border border-input bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
            <input
              type="text"
              placeholder="# Join via code"
              {...register("code")}
              autoFocus
              className="w-3/4 rounded-none bg-transparent px-4 py-2 text-sm text-foreground font-mono uppercase focus-visible:outline-none placeholder:text-muted-foreground"
              maxLength={10}
            />

            <button
              type="submit"
              disabled={joinProject.isPending}
              className="w-1/4 h-full py-2 text-sm rounded-none bg-accent font-medium disabled:opacity-50 transition-opacity hover:opacity-90 shrink-0 border-l border-input"
            >
              <span className="text-sm text-accent-foreground">
                {joinProject.isPending ? "..." : "Join"}
              </span>
            </button>
          </div>

          {errors.code && (
            <p className="text-xs text-destructive items-center">
              {errors.code.message}
            </p>
          )}

          {joinProject.isError && (
            <p className="text-xs text-destructive">
              {(joinProject.error as any)?.response?.data?.message ??
                "Could not join with that code."}
            </p>
          )}
        </form>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
