import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { timerCompleted } from '../timer';
import * as TasksActions from './task.actions';
import { selectActiveTask } from './task.selectors';
import { map, catchError, withLatestFrom, EMPTY } from 'rxjs';

@Injectable()
export class TaskEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  timerCompleted$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(timerCompleted),
      withLatestFrom(this.store.select(selectActiveTask)),
      map(([_, activeTask]) => {
        if (activeTask) {
          return TasksActions.saveTaskProgress({
            taskId: activeTask.id,
            elapsedTime: activeTask.duration,
            isCompleted: true,
          });
        }
        return { type: '[Task] No Active Task To Save' }; // Or EMPTY if using switchMap/mergeMap instead of map
      }),
      catchError((error) => {
        console.error('Error auto-saving task progress:', error);
        return EMPTY; // Return EMPTY observable to keep the effect alive
      }),
    );
  });

  deleteTask$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      map((action) => TasksActions.deleteTaskSuccess({ id: action.id })),
    );
  });
}
