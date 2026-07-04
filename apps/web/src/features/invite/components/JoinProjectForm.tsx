"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinProjectSchema, JoinProjectInput } from "../schemas/invite.schema";
import { useJoinProject } from "../hooks/useInvites";
import { useRouter } from "next/navigation";

export function JoinProjectForm() {
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
        router.push(`/projects/${res.project.id}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <label className="text-sm text-muted-fg">Have an invite code?</label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. PRXK7F2A"
          {...register("code")}
          className="flex-1 rounded-md border border-input bg-bg px-3 py-2 text-sm text-fg tracking-widest font-mono uppercase"
          maxLength={12}
        />
        <button
          type="submit"
          disabled={joinProject.isPending}
          className="px-4 py-2 text-sm rounded-md bg-primary text-bg font-medium disabled:opacity-50"
        >
          {joinProject.isPending ? "Joining..." : "Join"}
        </button>
      </div>

      {errors.code && (
        <p className="text-xs text-destructive">{errors.code.message}</p>
      )}

      {joinProject.isError && (
        <p className="text-xs text-destructive">
          {(joinProject.error as any)?.response?.data?.message ??
            "Could not join with that code."}
        </p>
      )}
    </form>
  );
}
