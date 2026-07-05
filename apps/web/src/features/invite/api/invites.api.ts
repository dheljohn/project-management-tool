import api from "../../../../lib/api"; // adjust to your actual configured Axios instance

export interface InviteCode {
  id: number;
  code: string;
  projectId: number;
  createdById: number;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  isRevoked: boolean;
  createdAt: string;
}

export interface JoinProjectResponse {
  project: {
    id: number;
    name: string;
    description: string | null;
  };
  membership: {
    id: number;
    role: "OWNER" | "MEMBER";
  };
}

export const invitesApi = {
  create: (
    projectId: number,
    data: { maxUses: number; expiresInDays: number },
  ) =>
    api
      .post<InviteCode>("/invites", { projectId, ...data })
      .then((res) => res.data),

  listForProject: (projectId: number) =>
    api
      .get<InviteCode[]>(`/invites/project/${projectId}`)
      .then((res) => res.data),

  revoke: (inviteId: number) =>
    api.delete(`/invites/${inviteId}`).then((res) => res.data),

  join: (code: string) =>
    api
      .post<JoinProjectResponse>("/invites/join", { code })
      .then((res) => res.data),
};
