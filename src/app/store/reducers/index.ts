import { ActionReducerMap } from '@ngrx/store';
import * as fromTimer from './timer.reducer';
import * as fromTask from './task.reducer';
import * as fromCategory from './category.reducer';

export interface AppState {
  timer: fromTimer.TimerState;
  tasks: fromTask.TaskState;
  categories: fromCategory.CategoryState;
}

export const reducers: ActionReducerMap<AppState> = {
  timer: fromTimer.timerReducer,
  tasks: fromTask.taskReducer,
  categories: fromCategory.categoryReducer,
};
