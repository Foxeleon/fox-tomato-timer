import { Injectable, inject } from '@angular/core';
import { Observable, interval, BehaviorSubject, Subject, startWith } from 'rxjs';
import { map, takeWhile, takeUntil, tap } from 'rxjs/operators';
import * as TimerActions from '../../store/actions/timer.actions';
import * as TasksActions from '../../store/actions/task.actions';
import { Store } from '@ngrx/store';
import {
  selectDuration,
  selectIsRunning,
  selectRemainingTime,
} from '../../store/selectors/timer.selectors';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  private currentDuration = 0;
  private pauseSubject = new Subject<void>();
  private timerObservable: Observable<number> | null = null;

  isRunning$: Observable<boolean>;
  isRunning = false;

  duration$: Observable<number>;
  duration: number = 25 * 60 * 1000; // Default 25 minutes in ms

  remainingTime$: Observable<number>;
  remainingTime: number = 25 * 60 * 1000; // Default 25 minutes in ms

  private store = inject(Store);
  private taskService = inject(TaskService);

  constructor() {
    this.isRunning$ = this.store.select(selectIsRunning);
    this.isRunning$.subscribe((isRunning) => (this.isRunning = isRunning));

    this.duration$ = this.store.select(selectDuration);
    this.duration$.subscribe((duration) => (this.duration = duration));

    this.remainingTime$ = this.store.select(selectRemainingTime);
    this.remainingTime$.subscribe((duration) => (this.remainingTime = duration));
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
        map((tick) => startValue - tick * 1000 - 1000), // Subtract 1 to account for the immediate emission
        takeWhile((remainingTime) => remainingTime >= 0),
        takeUntil(this.pauseSubject),
        tap((remainingTime) => this.timerSubject.next(remainingTime)),
        // Start with the initial value
        startWith(startValue),
      );
    }

    return this.timerObservable;
  }

  //  TODO logic for task timers for pause with new variable counts sum of time of all intervals of session
  pauseTimer() {
    this.pauseSubject.next();
    this.pauseSubject.complete();
    this.timerObservable = null;
    this.store.dispatch(TasksActions.pauseActiveTask());
  }

  stopTimer() {
    this.timerSubject.next(this.currentDuration);
    this.timerObservable = null;
    const activeTask = this.taskService.getActiveTask();

    if (activeTask) {
      const startTime = activeTask.startTime || Date.now();
      const stopActiveTask = {
        ...activeTask,
        state: 'pending' as 'pending' | 'completed' | 'active' | 'paused',
        startTime,
        elapsedTime: activeTask.elapsedTime + (Date.now() - startTime),
      };
      this.store.dispatch(TasksActions.stopTask({ activeTask: stopActiveTask }));
    }
  }

  resetTimer() {
    // Reset the timer to the current duration
    this.timerSubject.next(this.currentDuration);

    // Start a new timer with the current duration
    if (this.isRunning)
      this.store.dispatch(TimerActions.startTimer({ duration: this.currentDuration }));
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

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
