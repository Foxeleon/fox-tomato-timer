import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskState } from '../reducers/task.reducer';

export const selectTaskState = createFeatureSelector<TaskState>('tasks');

export const selectAllTasks = createSelector(
  selectTaskState,
  (state: TaskState) => state.tasks
);

export const selectTasksLoading = createSelector(
  selectTaskState,
  (state: TaskState) => state.loading
);

export const selectTasksError = createSelector(
  selectTaskState,
  (state: TaskState) => state.error
);

export const selectActiveTask = createSelector(
  selectTaskState,
  (state: TaskState) => state.activeTask
);

export const selectIsActiveTaskPaused = createSelector(
  selectTaskState,
  (taskState) => taskState.activeTask?.state === 'paused'
);

export const selectIsTaskInputActive = createSelector(
  selectTaskState,
  (state: TaskState) => state.isTaskInputActive
);

export const selectNewTaskTitle = createSelector(
  selectTaskState,
  (state: TaskState) => state.newTaskTitle
);
