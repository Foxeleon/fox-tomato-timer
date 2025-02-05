import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
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
import { TaskService } from '../../shared/services/task.service';
import { ActiveTask, Task } from '../../shared/interfaces/task.interface';
import { TimerService } from '../../shared/services/timer.service';

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

export class TimerComponent implements OnDestroy {
  timerState$: Observable<TimerState>;
  duration$: Observable<number>;
  duration: number;
  isRunning = false;
  isRunning$: Observable<boolean>;
  isPlayButtonEnabled$: Observable<boolean>;
  activeTask: ActiveTask | null;
  formattedRemainingTime: string;
  remainingTime: number;
  durationInput: string;

  private activeTaskSubscription: Subscription;
  private remainingTimeSubscription: Subscription;
  private isRunningSubscription: Subscription;

  constructor(private store: Store<{ timer: TimerState }>, private taskService: TaskService, private timerService: TimerService) {
    this.timerState$ = this.store.select(state => state.timer);
    const isTaskInputActive$ = this.store.select(selectIsTaskInputActive);
    const isActiveTaskPaused$ = this.store.select(selectIsActiveTaskPaused);
    this.isRunning$ = this.timerService.getIsRunningObservable();

    this.isPlayButtonEnabled$ = combineLatest([
      this.isRunning$,
      isTaskInputActive$,
      isActiveTaskPaused$
    ]).pipe(
      map(([isRunning, isTaskInputActive, isActiveTaskPaused]) =>
        isRunning || isTaskInputActive || isActiveTaskPaused
      )
    );

    this.activeTask = this.taskService.getActiveTask();
    this.activeTaskSubscription = this.taskService.getActiveTaskObservable().subscribe(task => this.activeTask = task);

    this.remainingTime = this.timerService.getRemainingTime();
    this.formattedRemainingTime = this.formatTime(timerService.getRemainingTime());
    this.remainingTimeSubscription = this.timerService.getRemainingTimeObservable().subscribe(remainingTime => this.formattedRemainingTime = this.formatTime(remainingTime));

    this.duration = this.timerService.getDuration();
    this.duration$ = this.timerService.getDurationObservable();
    this.duration$.subscribe(duration => this.duration = duration);

    this.isRunningSubscription = this.isRunning$.subscribe(isRunning => this.isRunning = isRunning);
    this.durationInput = this.formatTime(this.duration);
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.activeTask === null) {
      this.taskService.addTask(this.duration);
    } else {
      this.taskService.setActiveTask(this.activeTask.id);
      // TODO After pause starting of timer gives default remainingTime first time. Fix?
      this.store.dispatch(TimerActions.startTimer({ duration: this.remainingTime }));
    }
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

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  changeDurationInput() {
    const [minutes, seconds] = this.durationInput.split(':').map(Number);
    this.store.dispatch(TimerActions.setDuration({ duration: ((minutes * 60) + seconds) * 1000 }));
  }

  ngOnDestroy(): void {
    this.activeTaskSubscription.unsubscribe();
    this.remainingTimeSubscription.unsubscribe();
    this.isRunningSubscription.unsubscribe();
  }
}
