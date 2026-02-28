import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TimerActions from './timer.actions';
import { TimerStore } from '../../components/timer/domain/timer.store';
import { tap } from 'rxjs';

@Injectable()
export class TimerEffects {
  private readonly actions$ = inject(Actions);
  private readonly timerStore = inject(TimerStore);

  startTimer$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TimerActions.startTimer),
        tap((action) => this.timerStore.start(action.duration)),
      ),
    { dispatch: false },
  );

  pauseTimer$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TimerActions.pauseTimer),
        tap(() => this.timerStore.pause()),
      ),
    { dispatch: false },
  );

  stopTimer$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TimerActions.stopTimer),
        tap(() => this.timerStore.reset()),
      ),
    { dispatch: false },
  );

  resetTimer$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TimerActions.resetTimer),
        tap((action) => this.timerStore.reset(action.duration)),
      ),
    { dispatch: false },
  );
}
