export interface Task {
  id: string;
  title: string;
  description?: string;
  state: 'pending' | 'active' | 'paused' | 'completed';
  categoryId?: string;
  duration: number;
  elapsedTime: number;
  order: number;
}

export interface ActiveTask extends Task {
  startTime: number;
}
