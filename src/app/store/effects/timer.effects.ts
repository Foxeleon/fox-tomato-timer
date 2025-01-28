import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TimerActions from '../actions/timer.actions';
import { TimerService } from '../../shared/services/timer.service';
import { map, mergeMap, takeUntil, switchMap } from 'rxjs/operators';
import { tap } from 'rxjs';

@Injectable()
export class TimerEffects {
  startTimer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimerActions.startTimer),
      mergeMap(action =>
        this.timerService.startTimer(action.duration).pipe(
          map(remainingTime => TimerActions.tickTimer({ remainingTime })),
          takeUntil(this.actions$.pipe(ofType(TimerActions.stopTimer, TimerActions.resetTimer)))
        )
      )
    )
  );

  pauseTimer$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TimerActions.pauseTimer),
        tap(() => this.timerService.pauseTimer())
      ),
    { dispatch: false }
  );

  stopTimer$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TimerActions.stopTimer),
        tap(() => this.timerService.stopTimer())
      ),
    { dispatch: false }
  );

  resetTimer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimerActions.resetTimer),
      switchMap(action => {
        this.timerService.resetTimer(action.duration);
        return [TimerActions.tickTimer({ remainingTime: action.duration })];
      })
    )
  );

  setDuration$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TimerActions.setDuration),
        tap(action => this.timerService.setDuration(action.duration))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private timerService: TimerService
  ) {}
}
