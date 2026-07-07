export const projectKeys = {
  all: ["projects"] as const,
  list: () => ["projects", "list"] as const,
  detail: (id: number) => ["projects", id] as const,
  tasks: (projectId: number) => ["projects", projectId, "tasks"] as const,
  logs: (projectId: number) => ["projects", projectId, "logs"] as const,
  members: (projectId: number) => ["projects", projectId, "members"] as const,
};

export const inviteKeys = {
  byProject: (projectId: number) => ["invites", "project", projectId] as const,
};
