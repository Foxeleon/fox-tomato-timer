import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as TimerActions from './store/actions/timer.actions';
import { TimerState } from './store/reducers/timer.reducer';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Fox Tomato Timer';
  timerState$: Observable<TimerState>;

  constructor(private store: Store<{ timer: TimerState }>) {
    this.timerState$ = store.select(state => state.timer);
  }

  ngOnInit() {}

  startTimer() {
    this.store.dispatch(TimerActions.startTimer({ duration: 1500 }));
  }

  pauseTimer() {
    this.store.dispatch(TimerActions.pauseTimer());
  }

  resetTimer() {
    this.store.dispatch(TimerActions.resetTimer({ duration: 1500 }));
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
