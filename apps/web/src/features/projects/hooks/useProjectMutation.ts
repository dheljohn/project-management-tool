import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  updateProject,
  ProjectPayload,
} from "../api/projects.api";
import { Project } from "../../../types/types";
import { projectKeys } from "../../../../lib/queryKeys";

interface UseProjectMutationArgs {
  mode: "create" | "edit";
  projectId?: number;
  onSuccess: (project: Project) => void;
}

export const useProjectMutation = ({
  mode,
  projectId,
  onSuccess,
}: UseProjectMutationArgs) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ProjectPayload>) =>
      mode === "create"
        ? createProject(payload as ProjectPayload)
        : updateProject(projectId!, payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      onSuccess(project);
    },
  });
};
