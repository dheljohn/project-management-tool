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
    mutationFn: (taskId: number) => {
      console.debug('[useDeleteTaskMutation] mutationFn called', {
        taskId,
        projectId,
      });
      return deleteTask(taskId);
    },
    onMutate: async (taskId: number) => {
      const queryKey = projectKeys.tasks(projectId);
      console.debug(
        '[useDeleteTaskMutation] onMutate: optimistically removing task',
        {
          taskId,
          queryKey,
        },
      );

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Task[]>(queryKey);
      console.debug(
        '[useDeleteTaskMutation] onMutate: previous cache snapshot',
        previous,
      );

      queryClient.setQueryData<Task[]>(queryKey, (prev = []) => {
        const next = prev.filter((t) => t.id !== taskId);
        console.debug('[useDeleteTaskMutation] onMutate: cache after removal', {
          before: prev.length,
          after: next.length,
        });
        return next;
      });

      return { previous };
    },
    onError: (err, taskId, context) => {
      console.debug('[useDeleteTaskMutation] onError: rolling back', {
        taskId,
        error: err,
        hadPrevious: !!context?.previous,
      });

      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.tasks(projectId),
          context.previous,
        );
      }
    },
    onSettled: (data, error, taskId) => {
      console.debug('[useDeleteTaskMutation] onSettled: invalidating queries', {
        taskId,
        hadError: !!error,
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
    },
    onSuccess: (data, taskId) => {
      console.debug('[useDeleteTaskMutation] onSuccess', { taskId, data });
      onSuccess();
    },
  });
};
