import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TimerState } from './timer.reducer';

export const selectTimerState = createFeatureSelector<TimerState>('timer');

export const selectIsRunning = createSelector(
  selectTimerState,
  (state: TimerState) => state.isRunning,
);

export const selectRemainingTime = createSelector(
  selectTimerState,
  (state: TimerState) => state.remainingTime,
);

export const selectDuration = createSelector(
  selectTimerState,
  (state: TimerState) => state.duration,
);
