export interface Task {
  id: string;
  title: string;
  description?: string;
  state: 'completed' | 'active' | 'paused' | 'pending';
  categoryId?: string;
  duration: number;
  elapsedTime: number;
  order: number;
}

export interface ActiveTask extends Task {
  startTime: number;
}
