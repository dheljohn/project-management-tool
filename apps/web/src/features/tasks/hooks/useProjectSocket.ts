import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../../../lib/queryKeys";
import { Task } from "../../../types/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useProjectSocket(projectId: number) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinProject", { projectId });
    });

    // New task created by someone else — append it to the cached list.
    socket.on("task:created", ({ task }: { task: Task }) => {
      queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
        if (!old) return old;
        // Guard against double-adding if this event somehow arrives
        // for a task we already have (e.g. our own optimistic update).
        if (old.some((t) => t.id === task.id)) return old;
        return [...old, task];
      });
    });

    // Existing task updated by someone else — replace it in place.
    socket.on("task:updated", ({ task }: { task: Task }) => {
      queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === task.id ? task : t));
      });
    });

    // Activity log changed — logs use infinite/paginated queries, so
    // rather than manually patching pages (fiddly, easy to get wrong),
    // just invalidate and let it refetch. Not latency-sensitive like
    // task drag-and-drop, so a network round-trip here is fine.
    socket.on("log:created", () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, queryClient]);
}
