import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TimerActions from '../actions/timer.actions';
import { map } from 'rxjs/operators';

@Injectable()
export class TimerEffects {
  constructor(private actions$: Actions) {}

  // Add your timer effects here
}
