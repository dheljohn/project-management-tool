export interface CreateChangeLogDto {
  taskId: number;
  projectId: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  message: string;
}
