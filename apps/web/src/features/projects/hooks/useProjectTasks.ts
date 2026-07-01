import { useQuery } from "@tanstack/react-query";
import { getTasksByProject } from "../api/projects.api";
import { projectKeys } from "../../../../lib/queryKeys";

export const useProjectTasks = (projectId: number) => {
  return useQuery({
    queryKey: projectKeys.tasks(projectId),
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
  });
};
