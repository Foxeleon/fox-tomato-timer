import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  startTimer(duration: number): Observable<number> {
    return interval(1000).pipe(
      map(tick => duration - tick - 1),
      takeWhile(timeLeft => timeLeft >= 0)
    );
  }
}
