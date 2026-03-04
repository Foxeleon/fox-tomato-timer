import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import {
  selectIsActiveTaskPaused,
  selectIsTaskInputActive,
  selectActiveTask,
  saveTaskProgress,
} from '../../store/tasks';
import { TaskService } from '../../shared/services/task.service';
import { TimerStore } from './domain/timer.store';

@Component({
  selector: 'app-timer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  animations: [
    trigger('rotateAnimation', [
      state('play', style({ transform: 'rotate(0deg)' })),
      state('pause', style({ transform: 'rotate(180deg)' })),
      transition('play <=> pause', animate('300ms ease-in-out')),
    ]),
  ],
})
export class TimerComponent {
  protected readonly timerStore = inject(TimerStore);
  private readonly store = inject(Store);
  private readonly taskService = inject(TaskService);

  readonly activeTask = this.store.selectSignal(selectActiveTask);

  protected readonly isTaskInputActive = toSignal(this.store.select(selectIsTaskInputActive), {
    initialValue: false,
  });
  private readonly isActiveTaskPaused = toSignal(this.store.select(selectIsActiveTaskPaused), {
    initialValue: false,
  });

  protected readonly isPlayButtonEnabled = computed(
    () =>
      this.timerStore.status() === 'running' ||
      this.isTaskInputActive() ||
      this.isActiveTaskPaused() ||
      this.activeTask() !== null,
  );

  toggleTimer(): void {
    if (this.timerStore.status() === 'running') {
      this.timerStore.pause();
    } else if (this.timerStore.status() === 'paused') {
      this.timerStore.resume();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    const activeTask = this.activeTask();
    if (activeTask === null) {
      if (this.isTaskInputActive()) {
        this.taskService.addTask(this.timerStore.baseDurationMs());
      }
      return;
    } else {
      this.taskService.setActiveTask(activeTask.id);
      this.timerStore.start(activeTask.duration - activeTask.elapsedTime);
    }
  }

  stopTimer(): void {
    const task = this.activeTask();
    this.timerStore.pause();
    if (task) {
      this.store.dispatch(
        saveTaskProgress({
          taskId: task.id,
          elapsedTime: task.duration - this.timerStore.remainingMs(),
        }),
      );
      this.store.dispatch({ type: '[Task] Clear Active Task' });
    }
    this.timerStore.reset(this.timerStore.baseDurationMs());
  }

  resetTimer(): void {
    const task = this.activeTask();
    if (task) {
      this.timerStore.resetTimeOnly(task.duration);
      this.store.dispatch(saveTaskProgress({ taskId: task.id, elapsedTime: 0 }));
    } else {
      this.timerStore.resetTimeOnly(this.timerStore.baseDurationMs());
    }
  }

  protected formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
