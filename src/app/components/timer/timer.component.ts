import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import * as TimerActions from '../../store/actions/timer.actions';
import * as TaskActions from '../../store/actions/task.actions';
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

export class TimerComponent implements OnInit, OnDestroy {
  timerState$: Observable<TimerState>;
  duration$: Observable<number>;
  duration: number;
  isRunning = false;
  isPlayButtonEnabled$: Observable<boolean>;
  activeTask: ActiveTask | null;

  private activeTaskSubscription: Subscription;

  constructor(private store: Store<{ timer: TimerState }>, private taskService: TaskService, private timerService: TimerService) {
    this.timerState$ = this.store.select(state => state.timer);
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
    this.activeTask = this.taskService.getActiveTask();
    this.activeTaskSubscription = this.taskService.getActiveTaskObservable().subscribe(task => {
      this.activeTask = task;
    });

    this.duration = this.timerService.getDuration();
    this.duration$ = this.timerService.getDurationObservable();
    this.duration$.subscribe(duration => console.log('Duration timer component:', this.duration));

  //   TODO add selectRemainingTime and selectIsRunning
  }

  ngOnInit() {
   this.timerState$.subscribe(state => {
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
    if (this.activeTask === null) {
      this.taskService.addTask(this.duration);
    } else {
      this.taskService.setActiveTask(this.activeTask.id);
      this.store.dispatch(TimerActions.startTimer({ duration: this.duration }));
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

  changeDuration() {
    this.store.dispatch(TimerActions.setDuration({ duration: this.duration }));
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    console.log('formatTime:', minutes, remainingSeconds);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.activeTaskSubscription.unsubscribe();
  }
}
