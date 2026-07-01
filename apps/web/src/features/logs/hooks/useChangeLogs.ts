import { useQuery } from "@tanstack/react-query";
import { getChangeLogByProject } from "../api/logs.api";
import { projectKeys } from "../../../../lib/queryKeys";

export const useChangeLogs = (projectId: number) => {
  return useQuery({
    queryKey: projectKeys.logs(projectId),
    queryFn: () => getChangeLogByProject(projectId),
    enabled: !!projectId,
  });
};
