import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, Subject, take, startWith } from 'rxjs';
import { map, takeWhile, takeUntil, tap } from 'rxjs/operators';
import * as TimerActions from '../../store/actions/timer.actions';
import * as TasksActions from '../../store/actions/task.actions';
import { Store } from '@ngrx/store';
import { selectDuration, selectIsRunning, selectRemainingTime } from '../../store/selectors/timer.selectors';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  private currentDuration: number = 0;
  private pauseSubject = new Subject<void>();
  private timerObservable: Observable<number> | null = null;
  isRunning$: Observable<boolean>;
  duration$: Observable<number>;
  duration: number = 25 * 60 * 1000; // Default 25 minutes in ms
  remainingTime$: Observable<number>;
  remainingTime: number = 25 * 60 * 1000; // Default 25 minutes in ms

  constructor(private store: Store) {
    this.isRunning$ = this.store.select(selectIsRunning);
    this.duration$ = this.store.select(selectDuration);
    this.duration$.subscribe(duration => this.duration = duration);

    this.remainingTime$ = this.store.select(selectRemainingTime);
    this.remainingTime$.subscribe(duration => this.remainingTime = duration);
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
        map(tick => startValue - tick*1000 - 1000), // Subtract 1 to account for the immediate emission
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

  getDurationObservable(): Observable<number> {
    return this.duration$;
  }

  getDuration(): number {
    return this.duration;
  }


  getRemainingTimeObservable(): Observable<number> {
    return this.remainingTime$;
  }

  getRemainingTime(): number {
    return this.remainingTime;
  }

  getIsRunningObservable(): Observable<boolean> {
    return this.isRunning$;
  }

  setDuration(duration: number) {
    this.currentDuration = duration;
    if (this.timerSubject.value === 0) {
      this.timerSubject.next(duration);
    }
  }
}
