import api from "../../../../lib/api";
import { Project, Task } from "../../../types/types";

export const getTasksByProject = async (projectId: number): Promise<Task[]> => {
  const { data } = await api.get("/test03/get_all_tasks_by_project", {
    params: { projectId },
  });
  return data;
};

export interface ProjectPayload {
  name?: string;
  description?: string;
  wipLimit?: number | null;
}

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get("/test02/get_user_projects");
  return data;
};

export const getProject = async (id: number): Promise<Project> => {
  const { data } = await api.get("/test02/get_project", { params: { id } });
  return data;
};

export const createProject = async (
  payload: ProjectPayload,
): Promise<Project> => {
  const { data } = await api.post("/test02/create_project", payload);
  return data;
};

export const updateProject = async (
  id: number,
  payload: ProjectPayload,
): Promise<Project> => {
  const { data } = await api.patch("/test02/patch_project", { id, ...payload });
  return data;
};
