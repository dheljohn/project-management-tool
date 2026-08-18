export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  wipLimit: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  assignees: TaskAssignee[];
}

export interface TaskAssignee {
  id: number;
  taskId: number;
  memberId: number;
  member: {
    id: number;
    user_id: string;
    username: string | null;
  };
}
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Todo' | 'In_Progress' | 'Done';
export type TaskID = {
  task_id: number;
};

export interface BoardStateT {
  projectId: number;
  wipLimit?: number | null; // you already have this on Project
  tasks: Task[]; // flat list; group by status on the frontend
}

// Sent to a client right after joinProject succeeds
export interface BoardSnapshotEventT {
  type: 'boardSnapshot';
  payload: BoardStateT;
}

// Incremental live updates
export type BoardUpdateEventT =
  | { type: 'taskCreated'; payload: Task }
  | { type: 'taskUpdated'; payload: Task }
  | { type: 'taskDeleted'; payload: { id: number; projectId: number } }
  | {
      type: 'taskMoved';
      payload: {
        id: number;
        status: TaskStatus;
        projectId: number;
        version: number;
      };
    };

export interface ChangeLog {
  id: number;
  taskId: number;
  taskTitle: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  remark: string | null;
  createdAt: string;
  username: string;
  member?: {
    user_id: string;
    username: string | null;
  };
  task?: {
    id: number;
    title: string;
  };
}
export interface ActivityLogProps {
  logs: ChangeLog[];
  loading: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface Column {
  status: string;
  color: string;
  label: string;
}
