import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import * as TimerActions from '../../store/actions/timer.actions';
import { TimerState } from '../../store/reducers/timer.reducer';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';
import { selectIsActiveTaskPaused, selectIsTaskInputActive } from '../../store/selectors/task.selectors';
import { selectDuration } from '../../store/selectors/timer.selectors';
import { TaskService } from '../../shared/services/task.service';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  animations: [
    trigger('rotateAnimation', [
      state('play', style({ transform: 'rotate(0deg)' })),
      state('pause', style({ transform: 'rotate(180deg)' })),
      transition('play <=> pause', animate('300ms ease-in-out'))
    ])
  ]
})
export class TimerComponent implements OnInit {
  timerState$: Observable<TimerState>;
  duration: number = 25; // Default 25 minutes
  isRunning = false;
  isPlayButtonEnabled$: Observable<boolean>;

  constructor(private store: Store<{ timer: TimerState }>, private taskService: TaskService) {
    this.timerState$ = store.select(state => state.timer);
    const isTaskInputActive$ = this.store.select(selectIsTaskInputActive);
    const isActiveTaskPaused$ = this.store.select(selectIsActiveTaskPaused);

    this.isPlayButtonEnabled$ = combineLatest([
      this.timerState$,
      isTaskInputActive$,
      isActiveTaskPaused$
    ]).pipe(
      map(([timerState, isTaskInputActive, isActiveTaskPaused]) =>
        timerState.isRunning || isTaskInputActive || isActiveTaskPaused
      )
    );
  }

  ngOnInit() {
    this.timerState$.subscribe(state => {
      this.duration = Math.floor(state.duration);
      this.isRunning = state.isRunning;
    });
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.taskService.addTask(this.duration);
  }

  pauseTimer() {
    this.store.dispatch(TimerActions.pauseTimer());
  }

  resetTimer() {
    this.store.dispatch(TimerActions.resetTimer({ duration: this.duration }));
  }

  stopTimer() {
    this.store.dispatch(TimerActions.stopTimer());
  }

  changeDuration() {
    this.store.dispatch(TimerActions.setDuration({ duration: this.duration }));
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
