import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { Store } from '@ngrx/store';
import { timerCompleted } from '../../../store/timer/timer.actions';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface TimerSignalState {
  remainingMs: number;
  baseDurationMs: number;
  status: TimerStatus;
  mode: TimerMode;
}

const DEFAULT_DURATION_MS = 25 * 60 * 1000;

const initialState: TimerSignalState = {
  remainingMs: DEFAULT_DURATION_MS,
  baseDurationMs: DEFAULT_DURATION_MS,
  status: 'idle',
  mode: 'pomodoro',
};

export const TimerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const globalStore = inject(Store);

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const clearTimer = (): void => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startTicking = (): void => {
      clearTimer();
      intervalId = setInterval(() => {
        const currentMs = store.remainingMs();
        const next = currentMs - 1000;

        if (next <= 0) {
          clearTimer();
          patchState(store, { remainingMs: 0, status: 'completed' });
          globalStore.dispatch(timerCompleted());
        } else {
          patchState(store, { remainingMs: next });
        }
      }, 1000);
    };

    return {
      setBaseDuration(ms: number): void {
        if (ms > 0) {
          if (store.status() === 'idle') {
            patchState(store, { baseDurationMs: ms, remainingMs: ms });
          } else {
            patchState(store, { baseDurationMs: ms });
          }
        }
      },

      start(durationMs?: number): void {
        clearTimer();
        if (durationMs !== undefined) {
          patchState(store, {
            baseDurationMs: durationMs,
            remainingMs: durationMs,
            status: 'running',
          });
        } else {
          patchState(store, { status: 'running' });
        }
        startTicking();
      },

      pause(): void {
        clearTimer();
        patchState(store, { status: 'paused' });
      },

      resume(): void {
        if (store.status() !== 'paused') return;
        patchState(store, { status: 'running' });
        startTicking();
      },

      reset(durationMs?: number): void {
        clearTimer();
        const newDuration = durationMs ?? store.baseDurationMs();
        patchState(store, {
          baseDurationMs: newDuration,
          remainingMs: newDuration,
          status: 'idle',
        });
      },

      resetTimeOnly(durationMs: number): void {
        patchState(store, { remainingMs: durationMs });
      },

      cleanup(): void {
        clearTimer();
      },
    };
  }),
  withHooks({
    onDestroy(store) {
      store.cleanup();
    },
  }),
);
