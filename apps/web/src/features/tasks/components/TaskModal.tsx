"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues } from "../schemas/task.schema";
import { useTaskMutation } from "../hooks/useTaskMutation";
import { Task, TaskStatus } from "../../../types/types";
import { Button } from "../../../components/ui/Button";

interface TaskModalProps {
  mode: "create" | "update";
  task?: Task;
  projectId: number;
  onClose: () => void;
}

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: "Todo", value: "Todo" },
  { label: "In Progress", value: "In_Progress" },
  { label: "Done", value: "Done" },
];

export default function TaskModal({
  mode,
  task,
  projectId,
  onClose,
}: TaskModalProps) {
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "Todo");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      remark: "",
    },
  });

  const { mutate, isPending, error } = useTaskMutation({
    mode,
    projectId,
    taskId: task?.id,
    onSuccess: onClose,
  });

  const onSubmit = (values: TaskFormValues) => mutate({ ...values, status });

  const inputClass =
    "bg-muted border border-border rounded-md px-4 py-2 w-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-foreground text-lg font-semibold mb-5">
          {mode === "create" ? "Create Task" : "Edit Task"}
        </h2>

        <label className="text-muted-foreground text-xs block mb-1">
          Task Title
        </label>
        <input
          type="text"
          placeholder="Task Title"
          className={`${inputClass} mb-1`}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-xs mb-3">
            {errors.title.message}
          </p>
        )}
        {!errors.title && <div className="mb-4" />}

        <label className="text-muted-foreground text-xs block mb-1">
          Task Description (Optional)
        </label>
        <textarea
          placeholder="Task Description"
          className={`${inputClass} mb-4 resize-none`}
          rows={3}
          {...register("description")}
        />

        {/* {mode === "update" && (
          <>
            <label className="text-muted-foreground text-xs block mb-1">
              Status
            </label>
            <select
              title="task"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={`${inputClass} mb-4`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </>
        )} */}

        {error && (
          <p className="text-destructive text-sm mb-4">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="cancel" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="save" type="submit">
            {isPending
              ? mode === "update"
                ? "Updating..."
                : "Creating..."
              : mode === "update"
                ? "Save Changes"
                : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}
