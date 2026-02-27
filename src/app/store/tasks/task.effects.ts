import { Injectable, inject } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class TaskEffects {
  private actions$ = inject(Actions);

  // Add your task effects here
}
