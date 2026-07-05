import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/api";
import { projectKeys } from "../../../../lib/queryKeys";

export interface ProjectMember {
  id: number;
  role: "OWNER" | "MEMBER";
  member: {
    id: number;
    user_id: string;
    username: string | null;
    email: string;
  };
}

export const getProjectMembers = async (
  projectId: number,
): Promise<ProjectMember[]> => {
  const { data } = await api.get("/test02/get_project_members", {
    params: { projectId },
  });
  return data;
};

export const useProjectMembers = (projectId: number) => {
  return useQuery({
    queryKey: [...projectKeys.detail(projectId), "members"],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });
};
