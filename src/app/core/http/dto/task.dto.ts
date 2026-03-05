export interface TaskDto {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  categoryId?: string;
  createdAt: string; // ISO 8601
}
