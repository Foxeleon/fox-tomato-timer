import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormControl,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, CdkDragSortEvent, DragDropModule } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Task } from '../../shared/interfaces/task.interface';
import * as TasksActions from '../../store/tasks/task.actions';
import { selectNewTaskTitle, selectAllTasks, selectActiveTask } from '../../store/tasks';
import { TaskService } from '../../shared/services/task.service';
import { TimerStore } from '../timer/domain/timer.store';
import { formatDurationMmSs } from '../../shared/util/time.util';

@Component({
  selector: 'app-tasks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    DragDropModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  draggedDirection: 'draggingUp' | 'draggingDown' | 'idle' = 'idle';

  private readonly store = inject(Store);
  private readonly taskService = inject(TaskService);
  public readonly timerStore = inject(TimerStore);

  readonly tasks = this.store.selectSignal(selectAllTasks);
  readonly activeTask = this.store.selectSignal(selectActiveTask);
  readonly newTaskTitle = this.store.selectSignal(selectNewTaskTitle);

  // Custom validator to prevent 00:00 duration
  private zeroDuration(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const [minutes, seconds] = control.value.split(':').map(Number);
    const totalMs = (minutes * 60 + seconds) * 1000;

    return totalMs === 0 ? { zeroDuration: true } : null;
  }

  protected readonly durationInputControl = new FormControl(
    formatDurationMmSs(this.timerStore.baseDurationMs()),
    {
      validators: [
        Validators.required,
        Validators.pattern(/^([0-9]{1,2}):([0-5][0-9])$/),
        this.zeroDuration,
      ],
      updateOn: 'blur',
    },
  );

  ngOnInit() {
    this.store.dispatch(TasksActions.loadTasks());
  }

  onTaskInputChange(title: string) {
    this.store.dispatch(TasksActions.setNewTaskTitle({ title }));
    this.store.dispatch(TasksActions.setTaskInputActive({ isActive: title.trim().length > 0 }));
  }

  onDurationBlur(): void {
    if (this.durationInputControl.valid && this.durationInputControl.value) {
      const [minutes, seconds] = this.durationInputControl.value.split(':').map(Number);
      const ms = (minutes * 60 + seconds) * 1000;

      // Only set base duration if not zero (validator should prevent this, but double-check)
      if (ms > 0) {
        this.timerStore.setBaseDuration(ms);
        this.durationInputControl.setValue(formatDurationMmSs(ms));
      }
    }
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const currentTask = this.activeTask();
    const duration = this.timerStore.baseDurationMs();

    const task: Task = {
      id: crypto.randomUUID(),
      title,
      state: 'active',
      duration,
      elapsedTime: 0,
      order: 0,
    };

    if (currentTask) {
      this.store.dispatch(
        TasksActions.saveTaskProgress({
          taskId: currentTask.id,
          elapsedTime: currentTask.duration - this.timerStore.remainingMs(),
          isCompleted: false,
        }),
      );
    }

    this.store.dispatch(TasksActions.addTask({ task }));

    this.store.dispatch(TasksActions.setActiveTask({ taskId: task.id }));

    this.timerStore.start(task.duration);

    this.store.dispatch(TasksActions.setNewTaskTitle({ title: '' }));
    this.store.dispatch(TasksActions.setTaskInputActive({ isActive: false }));
  }

  playTask(task: Task): void {
    const currentActiveTask = this.activeTask();

    if (currentActiveTask?.id === task.id) {
      if (this.timerStore.status() === 'running') {
        this.timerStore.pause();
      } else {
        this.timerStore.resume();
      }
      return;
    }

    if (currentActiveTask) {
      this.timerStore.pause();
      const elapsedTime = currentActiveTask.duration - this.timerStore.remainingMs();
      this.store.dispatch(
        TasksActions.saveTaskProgress({
          taskId: currentActiveTask.id,
          elapsedTime,
          isCompleted: false,
        }),
      );
    }

    this.store.dispatch(TasksActions.setActiveTask({ taskId: task.id }));
    this.timerStore.start(task.duration - task.elapsedTime);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const updatedTasks = [...this.tasks()];
      const [movedTask] = updatedTasks.splice(event.previousIndex, 1);
      updatedTasks.splice(event.currentIndex, 0, movedTask);
      this.store.dispatch(TasksActions.updateTaskOrder({ tasks: updatedTasks }));
    }
    this.draggedDirection = 'idle';
  }

  onDragMoved(event: CdkDragSortEvent<Task[]>) {
    if (event.previousIndex > event.currentIndex) {
      this.draggedDirection = 'draggingUp';
    } else if (event.previousIndex < event.currentIndex) {
      this.draggedDirection = 'draggingDown';
    } else {
      this.draggedDirection = 'idle';
    }
  }

  editTask(task: Task) {
    const updatedTitle = prompt('Введите новое название задачи:', task.title);
    if (updatedTitle !== null && updatedTitle.trim() !== '') {
      this.taskService.patchTask(task.id, { title: updatedTitle.trim() });
    }
  }

  completeTask(task: Task) {
    if (task.state === 'active') {
      this.store.dispatch(TasksActions.completeActiveTask());
    } else if (task.state !== 'completed') {
      this.taskService.patchTask(task.id, { state: 'completed' });
    }
  }

  deleteTask(taskId: string): void {
    const isActive = this.activeTask()?.id === taskId;

    // Dispatch NgRx action for task deletion
    this.store.dispatch(TasksActions.deleteTask({ id: taskId }));

    // CRITICAL FIX: Reset timer to input field duration if deleting active task
    if (isActive) {
      const inputDuration = this.durationInputControl.value
        ? this.parseDurationString(this.durationInputControl.value)
        : this.timerStore.baseDurationMs();
      this.timerStore.reset(inputDuration);
    }
  }

  private parseDurationString(durationStr: string): number {
    if (!durationStr || typeof durationStr !== 'string') {
      return this.timerStore.baseDurationMs();
    }
    const [minutes, seconds] = durationStr.split(':').map(Number);
    return (minutes * 60 + seconds) * 1000;
  }

  // Expose shared util as protected method for template access
  protected formatDurationMmSs = formatDurationMmSs;
}
