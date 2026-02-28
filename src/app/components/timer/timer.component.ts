import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import {
  selectIsActiveTaskPaused,
  selectIsTaskInputActive,
} from '../../store/tasks/task.selectors';
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

  private readonly isTaskInputActive = toSignal(this.store.select(selectIsTaskInputActive), {
    initialValue: false,
  });
  private readonly isActiveTaskPaused = toSignal(this.store.select(selectIsActiveTaskPaused), {
    initialValue: false,
  });

  protected readonly isPlayButtonEnabled = computed(
    () =>
      this.timerStore.status() === 'running' ||
      this.isTaskInputActive() ||
      this.isActiveTaskPaused(),
  );

  protected readonly durationInputControl = new FormControl(
    this.formatTime(this.timerStore.remainingMs()),
    {
      validators: [Validators.required, Validators.pattern(/^([0-9][0-9]):([0-5][0-9])$/)],
      updateOn: 'blur',
    },
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
    const activeTask = this.taskService.getActiveTask();
    if (activeTask === null) {
      this.taskService.addTask(this.timerStore.remainingMs());
    } else {
      this.taskService.setActiveTask(activeTask.id);
      this.timerStore.start();
    }
  }

  pauseTimer(): void {
    this.timerStore.pause();
  }

  resetTimer(): void {
    this.timerStore.reset();
  }

  stopTimer(): void {
    this.timerStore.reset();
  }

  onDurationBlur(): void {
    if (this.durationInputControl.valid && this.durationInputControl.value) {
      const [minutes, seconds] = this.durationInputControl.value.split(':').map(Number);
      this.timerStore.reset((minutes * 60 + seconds) * 1000);
    }
  }

  protected formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
