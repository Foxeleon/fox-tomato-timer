import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, tap } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timerSubject = new BehaviorSubject<number>(0);
  timer$ = this.timerSubject.asObservable();

  startTimer(duration: number): Observable<number> {
    return interval(1000).pipe(
      map(tick => duration - tick),
      takeWhile(remainingTime => remainingTime >= 0),
      tap(remainingTime => this.timerSubject.next(remainingTime))
    );
  }

  stopTimer() {
    this.timerSubject.next(0);
  }

  resetTimer(duration: number) {
    this.timerSubject.next(duration);
  }
}
