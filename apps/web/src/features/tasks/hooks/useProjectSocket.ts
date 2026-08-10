import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '../../../../lib/queryKeys';
import { Project, Task } from '../../../types/types';
import api from '../../../../lib/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function useProjectSocket(projectId: number) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const hasConnectedBefore = useRef(false);

  useEffect(() => {
    if (!projectId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: async (cb) => {
        try {
          const { data } = await api.get('/testlogin/socket-token');
          cb({ token: data.token });
        } catch (error) {
          console.error('Failed to fetch socket token:', error);
          cb({});
        }
      },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const isReconnect = hasConnectedBefore.current;
      console.log(
        `[socket] ${isReconnect ? 'RECONNECTED' : 'connected'} — id: ${socket.id}, projectId: ${projectId}`,
      );

      socket.emit('joinProject', { projectId });
      console.log(`[socket] emitted joinProject for projectId: ${projectId}`);

      if (isReconnect) {
        console.log(
          `[socket] reconnect detected — invalidating queries for projectId: ${projectId}`,
        );

        queryClient.invalidateQueries({
          queryKey: projectKeys.detail(projectId),
        });
        console.log('[socket] invalidated: project detail');

        queryClient.invalidateQueries({
          queryKey: projectKeys.tasks(projectId),
          // refetchType: 'all',
        });
        console.log('[socket] invalidated: tasks');

        queryClient.invalidateQueries({
          queryKey: projectKeys.members(projectId),
        });
        console.log('[socket] invalidated: members');

        queryClient.invalidateQueries({
          queryKey: projectKeys.logs(projectId),
        });
        console.log('[socket] invalidated: logs');
      } else {
        console.log(
          '[socket] initial connect — skipping invalidation (React Query will fetch on mount)',
        );
      }

      hasConnectedBefore.current = true;
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('project:updated', ({ project }: { project: Project }) => {
      queryClient.setQueryData<Project>(projectKeys.detail(projectId), project);
    });

    socket.on('task:created', ({ task }: { task: Task }) => {
      queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
        if (!old) return old;

        if (old.some((t) => t.id === task.id)) return old;
        return [...old, task];
      });
    });

    socket.on('task:deleted', ({ task }: { task: Task }) => {
      console.log(`[timing] received at ${Date.now()}`);

      queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
        if (!old) return old;
        return old.filter((t) => t.id !== task.id);
      });
      // the delete also writes a changelog entry server-side, so refresh logs too
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
    });

    // socket.on('task:updated', ({ task }: { task: Task }) => {
    //   queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
    //     if (!old) return old;
    //     return old.map((t) => (t.id === task.id ? task : t));
    //   });
    // });
    socket.on('task:updated', ({ task }: { task: Task }) => {
      const now = new Date();
      console.log(
        `[timing] CLIENT received task:updated at ${now.toLocaleTimeString()}.${now.getMilliseconds()}`,
      );
      queryClient.setQueryData<Task[]>(projectKeys.tasks(projectId), (old) => {
        if (!old) return old;
        return old.map((t) => (t.id === task.id ? task : t));
      });
    });

    socket.on('member:joined', () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(projectId),
      });
    });

    socket.on('log:created', () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.logs(projectId) });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.onAny((eventName, ...args) => {
      console.log(`[socket] received event: "${eventName}"`, args);
    });

    return () => {
      console.log('[Socket] Cleanup: disconnecting socket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, queryClient]);
}
