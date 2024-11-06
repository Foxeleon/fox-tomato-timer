import { createAction, props } from '@ngrx/store';

export const startTimer = createAction('[Timer] Start');
export const pauseTimer = createAction('[Timer] Pause');
export const resetTimer = createAction('[Timer] Reset');
export const setDuration = createAction('[Timer] Set Duration', props<{ duration: number }>());
