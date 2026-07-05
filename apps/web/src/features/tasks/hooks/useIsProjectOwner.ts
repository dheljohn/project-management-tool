import { useProjectMembers } from "./useProjectMembers";
import { useCurrentUser } from "./../../auth/hooks/useCurrentUser";

export function useIsProjectOwner(projectId: number): boolean {
  const { data: members = [] } = useProjectMembers(projectId);
  const { data: me } = useCurrentUser();

  if (!me) return false;

  const myMembership = members.find((m) => m.member.id === me.id);
  return myMembership?.role === "OWNER";
}
