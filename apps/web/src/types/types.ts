export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "Todo" | "In_Progress" | "Done";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
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

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface ActivityLogProps {
  logs: ChangeLog[];
  loading: boolean;
}

export interface Column {
  status: string;
  color: string;
  label: string;
}
