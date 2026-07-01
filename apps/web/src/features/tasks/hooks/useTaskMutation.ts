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
}

export const useTaskMutation = ({
  mode,
  projectId,
  taskId,
  onSuccess,
}: UseTaskMutationArgs) => {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("user_id");

  return useMutation({
    mutationFn: (values: {
      title: string;
      description: string;
      status: TaskStatus;
      priority: Priority;
      remark: string;
    }) => {
      console.log("payload values:", values);
      if (mode === "create") {
        return createTask({
          project_id: projectId,
          user_id: userId,
          title: values.title,
          description: values.description,
          status: values.status,
          priority: values.priority,
          remark: values.remark || "Created via UI modal",
        });
      } else {
        return updateTask({
          task_id: taskId!,
          user_id: userId,
          title: values.title,
          description: values.description,
          status: toApiStatus(values.status),
          priority: values.priority,
          remark: values.remark || "Updated via UI modal",
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
