import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchTaskStatus } from "../api/tasks.api";
import { projectKeys } from "../../../../lib/queryKeys";
import { Task, TaskStatus } from "../../../types/types";

export const useTaskStatusMutation = (projectId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchTaskStatus,
    onMutate: async ({ task_id, status }) => {
      const queryKey = projectKeys.tasks(projectId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Task[]>(queryKey);

      queryClient.setQueryData<Task[]>(queryKey, (prev = []) =>
        prev.map((t) =>
          t.id === task_id
            ? { ...t, status: status.replace(" ", "_") as TaskStatus }
            : t,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.tasks(projectId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
    },
  });
};
