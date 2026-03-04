export interface SessionDto {
  id: string;
  userId: string;
  startedAt: string; // ISO 8601
  duration: number;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  taskId?: string;
}
