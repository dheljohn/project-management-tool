"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues, PRIORITIES } from "../schemas/task.schema";
import { useTaskMutation } from "../hooks/useTaskMutation";
import { Task, TaskStatus } from "../../../types/types";
import { Button } from "../../../components/ui/Button";

import { PRIORITY_CONFIG } from "../../../../lib/priority";
import { Priority } from "../../../types/types";
import { useProjectMembers } from "../hooks/useProjectMembers";

interface TaskModalProps {
  mode: "create" | "update";
  task?: Task;
  projectId: number;
  onClose: () => void;
}

export default function TaskModal({
  mode,
  task,
  projectId,
  onClose,
}: TaskModalProps) {
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "Todo");

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      remark: "",
      priority: task?.priority ?? "Medium",
      assigneeIds: task?.assignees.map((a) => a.member.id) ?? [],
    },
  });

  const { data: members = [] } = useProjectMembers(projectId);

  const { mutate, isPending, error } = useTaskMutation({
    mode,
    projectId,
    taskId: task?.id,
    onSuccess: onClose,
    assigneeIds: watch("assigneeIds"),
  });

  const onSubmit = (values: TaskFormValues) =>
    mutate({
      ...values,
      status,
      priority: values.priority as Priority,
      assigneeIds: values.assigneeIds as number[],
      remark: values.remark ?? undefined,
    });

  const inputClass =
    "bg-muted border border-border rounded-md px-3.5 py-2.5 sm:px-4 sm:py-2 w-full text-foreground text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

  const assigneeIds = watch("assigneeIds") ?? [];

  const addAssigneeRow = () => {
    setValue("assigneeIds", [...assigneeIds, NaN]);
  };

  const updateAssigneeAt = (index: number, memberId: number) => {
    const next = [...assigneeIds];
    next[index] = memberId;
    setValue("assigneeIds", next);
  };

  const removeAssigneeAt = (index: number) => {
    setValue(
      "assigneeIds",
      assigneeIds.filter((_, i) => i !== index),
    );
  };

  // A member already chosen in another row shouldn't appear again,
  // except in their own row (so switching selections still works).
  const optionsFor = (currentValue: number) =>
    members.filter(
      (m) => m.member.id === currentValue || !assigneeIds.includes(m.member.id),
    );

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-[2px]"
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

        <label className="text-muted-foreground text-xs block mb-1">
          Priority
        </label>

        <select className={`${inputClass} mb-4`} {...register("priority")}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_CONFIG[p as Priority].label}
            </option>
          ))}
        </select>

        <label className="text-muted-foreground text-xs block mb-1">
          Assignees
        </label>

        {assigneeIds.map((val, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <select
              title={`assignee-${index}`}
              value={Number.isNaN(val) ? "" : val}
              onChange={(e) => updateAssigneeAt(index, Number(e.target.value))}
              className={`${inputClass} flex-1`}
            >
              <option value="" disabled>
                Select a member
              </option>
              {optionsFor(val).map((m) => (
                <option key={m.member.id} value={m.member.id}>
                  {m.member.username ?? m.member.user_id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeAssigneeAt(index)}
              className="text-destructive text-sm px-2"
              aria-label="Remove assignee"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addAssigneeRow}
          className="text-accent text-xs mb-4 hover:underline"
        >
          + Add assignee
        </button>

        {error && (
          <p className="text-destructive text-sm mb-4">
            Something went wrong. Please try again.
          </p>
        )}

        <div
          className="flex flex-col-reverse sm:flex-row justify-end gap-2
          sticky bottom-0 bg-card pt-2 sm:pt-0 sm:static"
        >
          <Button
            variant="cancel"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button variant="save" type="submit" className="w-full sm:w-auto">
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
