import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import * as TimerActions from '../actions/timer.actions';
import { TimerService } from '../../shared/services/timer.service';

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

  constructor(
    private readonly actions$: Actions,
    private timerService: TimerService
  ) {}
}
