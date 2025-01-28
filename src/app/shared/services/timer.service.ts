import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, tap, Subject } from 'rxjs';
import { map, takeWhile, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  timer$ = this.timerSubject.asObservable();
  private currentDuration: number = 0;
  private pauseSubject = new Subject<void>();

  startTimer(duration: number): Observable<number> {
    this.currentDuration = duration;
    this.pauseSubject = new Subject<void>();
    return interval(1000).pipe(
      map(tick => duration - tick),
      takeWhile(remainingTime => remainingTime >= 0),
      takeUntil(this.pauseSubject),
      tap(remainingTime => this.timerSubject.next(remainingTime))
    );
  }

  stopTimer() {
    this.pauseSubject.next();
    this.pauseSubject.complete();
    this.timerSubject.next(0);
  }

  resetTimer(duration: number) {
    this.currentDuration = duration;
    this.pauseSubject.next();
    this.pauseSubject.complete();
    this.timerSubject.next(duration);
  }

  setDuration(duration: number) {
    this.currentDuration = duration;
    if (this.timerSubject.value === 0) {
      this.timerSubject.next(duration);
    } else {
      const remainingPercentage = this.timerSubject.value / this.currentDuration;
      const newRemainingTime = Math.round(duration * remainingPercentage);
      this.timerSubject.next(newRemainingTime);
    }
  }

  getCurrentDuration(): number {
    return this.currentDuration;
  }

  pauseTimer() {
    this.pauseSubject.next();
    this.pauseSubject.complete();
  }
}
