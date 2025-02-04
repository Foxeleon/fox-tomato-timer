import { createReducer, on } from '@ngrx/store';
import * as TimerActions from '../actions/timer.actions';

export interface TimerState {
  isRunning: boolean;
  duration: number;
  remainingTime: number;
}

export const initialState: TimerState = {
  isRunning: false,
  duration: 25 * 60 * 1000, // 25 minutes in seconds in ms
  remainingTime: 25 * 60 * 1000, // 25 minutes in seconds in ms
};

export const timerReducer = createReducer(
  initialState,
  on(TimerActions.startTimer, (state, { duration }) => ({ ...state, duration, remainingTime: duration, isRunning: true })),
  on(TimerActions.pauseTimer, state => ({ ...state, isRunning: false })),
  on(TimerActions.resetTimer, (state, { duration }) => ({ ...state, duration, remainingTime: duration })),
  on(TimerActions.setDuration, (state, { duration }) => ({ ...state, duration, remainingTime: duration })),
  on(TimerActions.tickTimer, (state, { remainingTime }) => ({ ...state, remainingTime })),
  on(TimerActions.stopTimer, state => ({...state, isRunning: false, remainingTime: state.duration })),
);
