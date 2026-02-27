import { Injectable, inject } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);

  // Add your category effects here
}
