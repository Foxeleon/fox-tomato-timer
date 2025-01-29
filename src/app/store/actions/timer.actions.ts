import { createAction, props } from '@ngrx/store';

export const startTimer = createAction('[Timer] Start', props<{ duration: number }>());
export const pauseTimer = createAction('[Timer] Pause');
export const resetTimer = createAction('[Timer] Reset', props<{ duration: number }>());
export const setDuration = createAction('[Timer] Set Duration', props<{ duration: number }>());
export const tickTimer = createAction('[Timer] Tick', props<{ remainingTime: number }>());
export const stopTimer = createAction('[Timer] Stop');
