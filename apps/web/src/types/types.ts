export type TaskStatus = "Todo" | "In_Progress" | "Done";

export interface Task {
  id: number;
  name: string;
  title?: string;
  description: string | null | undefined;
  contents?: string;
  status: TaskStatus;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeLog {
  id: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  remark: string | null;
  createdAt: string;
  task: { id: number; title: string };
  member: {
    user_id: string;
  };
}
