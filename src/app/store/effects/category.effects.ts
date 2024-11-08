import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as CategoryActions from '../actions/category.actions';
import { map } from 'rxjs/operators';

@Injectable()
export class CategoryEffects {
  constructor(private actions$: Actions) {}

  // Add your category effects here
}
