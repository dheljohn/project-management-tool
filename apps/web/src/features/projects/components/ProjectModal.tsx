"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, ProjectFormValues } from "../schemas/project.schema";
import { useProjectMutation } from "../hooks/useProjectMutation";
import { Project } from "../../../types/types";
import { Button } from "../../../components/ui/Button";

interface ProjectModalProps {
  mode: "create" | "edit";
  project?: Project;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export default function ProjectModal({
  mode,
  project,
  onClose,
  onSuccess,
}: ProjectModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });

  const { mutate, isPending, error } = useProjectMutation({
    mode,
    projectId: project?.id,
    onSuccess: (proj) => {
      onSuccess(proj);
      onClose();
    },
  });

  const onSubmit = (values: ProjectFormValues) => mutate(values);

  const inputClass =
    "w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-foreground text-lg font-semibold mb-5">
          {mode === "create" ? "Create Project" : "Edit Project"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-1">
            Project Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. ProjectFlow"
            className={inputClass}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-destructive text-xs mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-sm text-muted-foreground mb-1">
            Description{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <textarea
            placeholder="What is this project about?"
            rows={3}
            className={`${inputClass} resize-none`}
            {...register("description")}
          />
        </div>

        {error && (
          <p className="text-destructive text-sm mb-4">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="cancel" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="save">
            {isPending
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create Project"
                : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
