import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { selectIsTaskInputActive, selectActiveTask, saveTaskProgress } from '../../store/tasks';
import { TaskService } from '../../shared/services/task.service';
import { TimerStore } from './domain/timer.store';
import { formatDurationMmSs } from '../../shared/util/time.util';

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
})
export class TimerComponent {
  protected readonly timerStore = inject(TimerStore);
  private readonly store = inject(Store);
  private readonly taskService = inject(TaskService);

  readonly activeTask = this.store.selectSignal(selectActiveTask);

  protected readonly isTaskInputActive = toSignal(this.store.select(selectIsTaskInputActive), {
    initialValue: false,
  });

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

  // Expose shared util as protected method for template access
  protected formatDurationMmSs = formatDurationMmSs;
}
