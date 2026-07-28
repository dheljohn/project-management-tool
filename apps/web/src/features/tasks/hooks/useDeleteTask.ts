import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask } from '../api/tasks.api';
import { projectKeys } from '../../../../lib/queryKeys';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.tasks(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
      onSuccess();
    },
  });
};
