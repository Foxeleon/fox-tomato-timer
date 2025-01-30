import { createAction, props } from '@ngrx/store';
import { Task } from '../../shared/interfaces/task.interface';

export const loadTasks = createAction('[Task] Load Tasks');
export const loadTasksSuccess = createAction('[Task] Load Tasks Success', props<{ tasks: Task[] }>());

export const addTask = createAction('[Task] Add Task', props<{ task: Task }>());
export const updateTask = createAction('[Task] Update Task', props<{ task: Task }>());
export const deleteTask = createAction('[Task] Delete Task', props<{ id: string }>());

export const setActiveTask = createAction('[Task] Set Active Task', props<{ taskId: string }>());
export const pauseActiveTask = createAction('[Task] Pause Active Task');
export const completeActiveTask = createAction('[Task] Complete Active Task');
export const updateTaskOrder = createAction('[Tasks] Update Task Order', props<{ tasks: Task[] }>());
