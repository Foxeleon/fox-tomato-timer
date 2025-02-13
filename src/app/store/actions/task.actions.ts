import { createAction, props } from '@ngrx/store';
import { ActiveTask, Task } from '../../shared/interfaces/task.interface';

export const loadTasks = createAction('[Task] Load Tasks');
export const loadTasksSuccess = createAction('[Task] Load Tasks Success', props<{ tasks: Task[] }>());

export const addTask = createAction('[Task] Add Task', props<{ task: Task }>());
export const updateTask = createAction('[Task] Update Task', props<{ task: Task }>());
export const deleteTask = createAction('[Task] Delete Task', props<{ id: string }>());
export const stopTask = createAction('[Task] Stop Task', props<{ activeTask: ActiveTask }>());
export const updateTaskOrder = createAction('[Tasks] Update Task Order', props<{ tasks: Task[] }>());
export const patchTask = createAction(
  '[Task] Patch Task',
  props<{ taskId: string; changes: Partial<Task> }>()
);

export const setActiveTask = createAction('[Task] Set Active Task', props<{ taskId: string }>());
export const pauseActiveTask = createAction('[Task] Pause Active Task');
export const completeActiveTask = createAction('[Task] Complete Active Task');

export const setTaskInputActive = createAction(
  '[Task] Set Task Input Active',
  props<{ isActive: boolean }>()
);
export const setNewTaskTitle = createAction(
  '[Task] Set New Task Title',
  props<{ title: string }>()
);
