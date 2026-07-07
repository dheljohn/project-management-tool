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

export interface ProjectMemberWithUser {
  id: number;
  projectId: number;
  memberId: number;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
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

export function useProjectMembers(projectId: number) {
  return useQuery<ProjectMemberWithUser[]>({
    queryKey: projectKeys.members(projectId),
    queryFn: async () => {
      const { data } = await api.get("/test02/get_project_members", {
        params: { projectId },
      });
      return data;
    },
    enabled: !!projectId,
  });
}
