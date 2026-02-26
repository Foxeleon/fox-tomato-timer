import { createReducer, on } from '@ngrx/store';
import * as TaskActions from '../actions/task.actions';
import { ActiveTask, Task } from '../../shared/interfaces/task.interface';

export interface TaskState {
  tasks: Task[];
  activeTask: ActiveTask | null;
  loading: boolean;
  isTaskInputActive: boolean;
  newTaskTitle: string;
  error: string | null;
}

export const initialState: TaskState = {
  tasks: [],
  activeTask: null,
  loading: false,
  isTaskInputActive: false,
  newTaskTitle: '',
  error: null,
};

export const taskReducer = createReducer(
  initialState,
  on(TaskActions.addTask, (state, { task }) => ({ ...state, tasks: [...state.tasks, task] })),
  on(TaskActions.updateTask, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
  })),
  on(TaskActions.deleteTask, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((task) => task.id !== id),
  })),
  on(TaskActions.stopTask, (state, { activeTask }) => ({
    ...state,
    activeTask: null,
    tasks: state.tasks.map((t) => (t.id === activeTask.id ? activeTask : t)),
  })),
  on(TaskActions.patchTask, (state, { taskId, changes }) => {
    const updatedTasks = state.tasks.map((task) =>
      task.id === taskId ? { ...task, ...changes } : task,
    );

    // Обновляем activeTask, если он существует и совпадает с обновляемой задачей
    const updatedActiveTask =
      state.activeTask && state.activeTask.id === taskId
        ? { ...state.activeTask, ...changes }
        : state.activeTask;

    return {
      ...state,
      tasks: updatedTasks,
      activeTask: updatedActiveTask,
    };
  }),

  on(TaskActions.updateTaskOrder, (state, { tasks }) => ({ ...state, tasks })),

  on(TaskActions.setNewTaskTitle, (state, { title }) => ({
    ...state,
    newTaskTitle: title,
  })),

  on(TaskActions.setTaskInputActive, (state, { isActive }) => ({
    ...state,
    isTaskInputActive: isActive,
  })),

  on(TaskActions.setActiveTask, (state, { taskId }) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return state;
    const activeTask: ActiveTask = { ...task, state: 'active', startTime: Date.now() };
    return {
      ...state,
      activeTask,
      tasks: state.tasks.map((t) => (t.id === taskId ? activeTask : t)),
    };
  }),

  on(TaskActions.pauseActiveTask, (state) => {
    if (!state.activeTask) return state;
    const pausedTask: ActiveTask = {
      ...state.activeTask,
      state: 'paused',
      elapsedTime: state.activeTask.elapsedTime + (Date.now() - state.activeTask.startTime),
    };
    return {
      ...state,
      activeTask: pausedTask,
      tasks: state.tasks.map((t) => (t.id === pausedTask.id ? pausedTask : t)),
    };
  }),

  on(TaskActions.completeActiveTask, (state) => {
    if (!state.activeTask) return state;
    const completedTask: Task = {
      ...state.activeTask,
      state: 'completed',
      elapsedTime: state.activeTask.elapsedTime + (Date.now() - state.activeTask.startTime),
    };
    return {
      ...state,
      activeTask: null,
      tasks: state.tasks.map((t) => (t.id === completedTask.id ? completedTask : t)),
    };
  }),

  on(TaskActions.loadTasks, (state) => ({ ...state, loading: true })),
  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({ ...state, tasks, loading: false })),
  on(TaskActions.deleteTask, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((t) => t.id !== id),
  })),
);
