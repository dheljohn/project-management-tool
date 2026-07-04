import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invitesApi } from "../api/invites.api";
import { inviteKeys, projectKeys } from "../../../../lib/queryKeys";

export function useCreateInvite(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { maxUses: number; expiresInDays: number }) =>
      invitesApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inviteKeys.byProject(projectId),
      });
    },
  });
}

export function useProjectInvites(projectId: number) {
  return useQuery({
    queryKey: inviteKeys.byProject(projectId),
    queryFn: () => invitesApi.listForProject(projectId),
  });
}

export function useRevokeInvite(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: number) => invitesApi.revoke(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inviteKeys.byProject(projectId),
      });
    },
  });
}

export function useJoinProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => invitesApi.join(code),
    onSuccess: () => {
      // Refresh the user's project list so the newly joined project appears
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
