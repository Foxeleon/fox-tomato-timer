import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, Subject } from 'rxjs';
import { map, takeWhile, takeUntil, tap } from 'rxjs/operators';
import * as TimerActions from '../../store/actions/timer.actions';
import { Store } from '@ngrx/store';
import { TimerState } from '../../store/reducers/timer.reducer';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  timer$ = this.timerSubject.asObservable();
  private currentDuration: number = 0;
  private pauseSubject = new Subject<void>();
  private timerObservable: Observable<number> | null = null;

  constructor(private store: Store<{ timer: TimerState }>) {}

  startTimer(duration?: number): Observable<number> {
    if (duration !== undefined && this.timerSubject.value === 0) {
      // Only set duration if it's provided and the timer is not already running
      this.currentDuration = duration;
      this.timerSubject.next(duration);
    }

    if (this.timerObservable === null) {
      this.pauseSubject = new Subject<void>();
      const startValue = this.timerSubject.value;
      this.timerObservable = interval(1000).pipe(
        map(tick => startValue - tick),
        takeWhile(remainingTime => remainingTime >= 0),
        takeUntil(this.pauseSubject),
        tap(remainingTime => this.timerSubject.next(remainingTime))
      );
    }

    return this.timerObservable;
  }

  stopTimer() {
    this.pauseSubject.next();
    this.pauseSubject.complete();
    this.timerSubject.next(0);
    this.timerObservable = null;
  }

  resetTimer() {
    // Stop the current timer
    if (this.timerObservable) {
      this.pauseSubject.next();
      this.pauseSubject.complete();
    }

    // Reset the timer observable
    this.timerObservable = null;

    // Reset the timer to the current duration
    this.timerSubject.next(this.currentDuration);

    // Create a new pause subject for future use
    this.pauseSubject = new Subject<void>();

    // Start a new timer with the current duration
    this.store.dispatch(TimerActions.startTimer({ duration: this.currentDuration }));
  }

  setDuration(duration: number) {
    this.currentDuration = duration;
    if (this.timerSubject.value === 0) {
      this.timerSubject.next(duration);
    }
  }

  getCurrentDuration(): number {
    return this.currentDuration;
  }

  pauseTimer() {
    this.pauseSubject.next();
    this.pauseSubject.complete();
    this.timerObservable = null;
  }
}
