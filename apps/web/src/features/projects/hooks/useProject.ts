import { useQuery } from "@tanstack/react-query";
import { getProject } from "../api/projects.api";
import { projectKeys } from "../../../../lib/queryKeys";

export const useProject = (id: number) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
};
