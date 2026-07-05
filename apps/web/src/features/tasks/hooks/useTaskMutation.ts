import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "../api/tasks.api";
import { projectKeys } from "../../../../lib/queryKeys";
import { Priority, Task, TaskStatus } from "../../../types/types";

function toApiStatus(status: TaskStatus): string {
  return status === "In_Progress" ? "In Progress" : status;
}

interface UseTaskMutationArgs {
  mode: "create" | "update";
  projectId: number;
  taskId?: number;
  onSuccess: () => void;
  assigneeIds: number[];
}

export const useTaskMutation = ({
  mode,
  projectId,
  taskId,
  onSuccess,
}: UseTaskMutationArgs) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: {
      title: string;
      description: string;
      status: TaskStatus;
      priority: Priority;
      remark: string;
      assigneeIds: number[];
    }) => {
      if (mode === "create") {
        return createTask({
          project_id: projectId,
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          assigneeIds: values.assigneeIds,
          remark: values.remark?.trim() || undefined,
        });
      } else {
        return updateTask({
          task_id: taskId!,
          title: values.title,
          description: values.description,
          status: toApiStatus(values.status),
          priority: values.priority,
          remark: values.remark || undefined,
          assigneeIds: values.assigneeIds,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
      onSuccess();
    },
  });
};
