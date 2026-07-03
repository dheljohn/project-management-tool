// useChangeLogs.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../../../../lib/api";

export function useChangeLogs(projectId: number, field?: string) {
  return useInfiniteQuery({
    queryKey: ["changelogs", projectId, field],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get("/test04/get_change_log_by_project", {
        params: { projectId, cursor: pageParam, limit: 10, field },
      });
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!projectId,
  });
}
