import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TaskActions from '../actions/task.actions';
import { map } from 'rxjs/operators';

@Injectable()
export class TaskEffects {
  constructor(private actions$: Actions) {}

  // Add your task effects here
}
