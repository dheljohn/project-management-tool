export type TaskStatus = "Todo" | "In_Progress" | "Done";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}
