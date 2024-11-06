export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId?: string;
  duration?: number;
  // Добавьте другие необходимые поля
}
