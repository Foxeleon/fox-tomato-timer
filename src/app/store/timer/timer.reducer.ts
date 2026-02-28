import { createReducer, on } from '@ngrx/store';
import * as TimerActions from './timer.actions';

export interface TimerState {
  isRunning: boolean;
  duration: number;
}

export const initialState: TimerState = {
  isRunning: false,
  duration: 25 * 60 * 1000,
};

export const timerReducer = createReducer(
  initialState,
  on(TimerActions.startTimer, (state, { duration }) => ({ ...state, duration, isRunning: true })),
  on(TimerActions.pauseTimer, (state) => ({ ...state, isRunning: false })),
  on(TimerActions.resetTimer, (state, { duration }) => ({ ...state, duration, isRunning: false })),
  on(TimerActions.setDuration, (state, { duration }) => ({ ...state, duration })),
  on(TimerActions.stopTimer, (state) => ({ ...state, isRunning: false })),
  on(TimerActions.timerCompleted, (state) => ({ ...state, isRunning: false })),
);
