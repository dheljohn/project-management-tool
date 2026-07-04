"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  projectSchema,
  ProjectFormInput,
  ProjectFormOutput,
} from "../schemas/project.schema";
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
  } = useForm<ProjectFormInput, any, ProjectFormOutput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      wipLimit: project?.wipLimit ?? 0,
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

  const onSubmit = (values: ProjectFormOutput) => mutate(values);

  const inputClass =
    "w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-2 text-foreground text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card border border-border w-full sm:max-w-md
          rounded-t-2xl sm:rounded-xl
          p-5 sm:p-6
          max-h-[90vh] sm:max-h-[85vh]
          overflow-y-auto
          shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-foreground text-base sm:text-lg font-semibold mb-4 sm:mb-5">
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

        <div className="mb-5">
          <label className="block text-sm text-muted-foreground mb-1">
            WIP Limit{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <input
            type="number"
            placeholder="0"
            className={inputClass}
            {...register("wipLimit")}
          />
          {errors.wipLimit && (
            <p className="text-destructive text-xs mt-1">
              {errors.wipLimit.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-destructive text-sm mb-4">
            Something went wrong. Please try again.
          </p>
        )}

        <div
          className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3
          sticky bottom-0 bg-card pt-2 sm:pt-0 sm:static"
        >
          <Button
            onClick={onClose}
            variant="cancel"
            type="button"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" variant="save" className="w-full sm:w-auto">
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
