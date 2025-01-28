import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as TimerActions from '../../store/actions/timer.actions';
import { TimerState } from '../../store/reducers/timer.reducer';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  timerState$: Observable<TimerState>;
  duration: number = 25; // Default 25 minutes

  constructor(private store: Store<{ timer: TimerState }>) {
    this.timerState$ = store.select(state => state.timer);
  }

  ngOnInit() {
    this.timerState$.subscribe(state => {
      this.duration = Math.floor(state.duration / 60);
    });
  }

  startTimer() {
    this.store.dispatch(TimerActions.startTimer({ duration: this.duration * 60 }));
  }

  pauseTimer() {
    this.store.dispatch(TimerActions.pauseTimer());
  }

  resetTimer() {
    this.store.dispatch(TimerActions.resetTimer({ duration: this.duration * 60 }));
  }

  changeDuration() {
    this.store.dispatch(TimerActions.setDuration({ duration: this.duration * 60 }));
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
