import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask } from '../api/tasks.api';
import { projectKeys } from '../../../../lib/queryKeys';
import { Task } from '../../../types/types';

interface UseDeleteTaskMutationArgs {
  projectId: number;
  onSuccess: () => void;
}

export const useDeleteTaskMutation = ({
  projectId,
  onSuccess,
}: UseDeleteTaskMutationArgs) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onMutate: async (taskId: number) => {
      const queryKey = projectKeys.tasks(projectId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (prev = []) =>
        prev.filter((t) => t.id !== taskId),
      );
      return { previous };
    },
    onError: (_err, _taskId, context) => {
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
    onSuccess: () => {
      onSuccess();
    },
  });
};
