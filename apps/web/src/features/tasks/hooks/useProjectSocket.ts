import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../../../lib/queryKeys";
import { Project, Task } from "../../../types/types";
import api from "../../../../lib/api"; // adjust to match actual relative depth

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function useProjectSocket(projectId: number) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: (cb) => {
        api
          .get("/testlogin/socket-token")
          .then(({ data }) => cb({ token: data.token }))
          .catch(() => cb({}));
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinProject", { projectId });
    });

    socket.on("connect_error", (err) => {
      // Surfaces auth failures (expired/missing token) instead of failing silently
      console.error("Socket connection error:", err.message);
    });

    socket.on("project:updated", ({ project }: { project: Project }) => {
      queryClient.setQueryData<Project>(projectKeys.detail(projectId), project);
    });

    socket.on("task:created", ({ task }: { task: Task }) => {
      queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
        if (!old) return old;

        if (old.some((t) => t.id === task.id)) return old;
        return [...old, task];
      });
    });

    socket.on("task:updated", ({ task }: { task: Task }) => {
      queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === task.id ? task : t));
      });
    });

    socket.on("log:created", () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, queryClient]);
}
