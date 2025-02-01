import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, Subject, take, startWith } from 'rxjs';
import { map, takeWhile, takeUntil, tap } from 'rxjs/operators';
import * as TimerActions from '../../store/actions/timer.actions';
import * as TasksActions from '../../store/actions/task.actions';
import { Store } from '@ngrx/store';
import { TimerState } from '../../store/reducers/timer.reducer';
import { selectIsRunning } from '../../store/selectors/timer.selectors';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  private currentDuration: number = 0;
  private pauseSubject = new Subject<void>();
  private timerObservable: Observable<number> | null = null;
  isRunning$: Observable<boolean>;

  constructor(private store: Store) {
    this.isRunning$ = this.store.select(selectIsRunning);
  }

  startTimer(duration?: number): Observable<number> {
    if (duration !== undefined && this.timerSubject.value === 0) {
      this.currentDuration = duration;
      this.timerSubject.next(duration);
    }

    if (this.timerObservable === null) {
      this.pauseSubject = new Subject<void>();
      const startValue = this.timerSubject.value;

      // Emit the initial value immediately
      this.timerSubject.next(startValue);

      this.timerObservable = interval(1000).pipe(
        map(tick => startValue - tick - 1), // Subtract 1 to account for the immediate emission
        takeWhile(remainingTime => remainingTime >= 0),
        takeUntil(this.pauseSubject),
        tap(remainingTime => this.timerSubject.next(remainingTime)),
        // Start with the initial value
        startWith(startValue)
      );
    }

    return this.timerObservable;
  }

  pauseTimer() {
    this.pauseSubject.next();
    this.pauseSubject.complete();
    this.timerObservable = null;
    this.store.dispatch(TasksActions.pauseActiveTask());
  }

  stopTimer() {
    this.timerSubject.next(this.currentDuration);
    this.timerObservable = null;
  }

  resetTimer() {
    // Reset the timer to the current duration
    this.timerSubject.next(this.currentDuration);

    this.isRunning$.pipe(take(1)).subscribe(isRunning => {
      // Start a new timer with the current duration
      if (isRunning) this.store.dispatch(TimerActions.startTimer({ duration: this.currentDuration }));
    });
  }

  setDuration(duration: number) {
    this.currentDuration = duration;
    if (this.timerSubject.value === 0) {
      this.timerSubject.next(duration);
    }
  }
}
