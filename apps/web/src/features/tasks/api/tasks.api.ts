import api from '../../../../lib/api';
import { Priority, Task, TaskStatus, TaskID } from '../../../types/types';

export const getTasksByProject = async (projectId: number): Promise<Task[]> => {
  const { data } = await api.get('/test03/get_all_tasks_by_project', {
    params: { projectId },
  });
  return data;
};

export const patchTaskStatus = async (payload: {
  task_id: number;
  status: string;
}): Promise<Task> => {
  const { data } = await api.patch('/test03/patch_task', payload);
  return data;
};

export interface DeleteTaskPayload {
  task_id: number;
}

export interface CreateTaskPayload {
  project_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  remark?: string;
  assigneeIds: number[];
}

export interface UpdateTaskPayload {
  task_id: number;
  title: string;
  description: string;
  status: string;
  priority: Priority;
  remark?: string;
  assigneeIds: number[];
}

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const { data } = await api.post('/test03/create_task', payload);
  return data;
};

export const updateTask = async (payload: UpdateTaskPayload): Promise<Task> => {
  const { data } = await api.patch('/test03/patch_task', {
    id: payload.task_id,
    ...payload,
  });
  console.log(data);
  return data;
};

export const deleteTask = async (taskId: number): Promise<TaskID> => {
  const { data } = await api.delete('/test03/delete_task', {
    params: { task_id: taskId },
  });
  return data;
};
