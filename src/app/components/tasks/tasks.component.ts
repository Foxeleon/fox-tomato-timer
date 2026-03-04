import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { animate, transition, trigger } from '@angular/animations';

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
  animations: [
    trigger('dragAnimation', [
      transition('idle => draggingUp', animate('200ms ease-in-out')),
      transition('idle => draggingDown', animate('200ms ease-in-out')),
      transition('draggingUp => idle', animate('200ms ease-in')),
      transition('draggingDown => idle', animate('200ms ease-in')),
    ]),
  ],
})
export class TasksComponent implements OnInit {
  draggedDirection: 'draggingUp' | 'draggingDown' | 'idle' = 'idle';

  private readonly store = inject(Store);
  private readonly taskService = inject(TaskService);
  public readonly timerStore = inject(TimerStore);

  readonly tasks = this.store.selectSignal(selectAllTasks);
  readonly activeTask = this.store.selectSignal(selectActiveTask);
  readonly newTaskTitle = this.store.selectSignal(selectNewTaskTitle);

  protected readonly durationInputControl = new FormControl(
    this.formatMsToMmSs(this.timerStore.baseDurationMs()),
    {
      validators: [Validators.required, Validators.pattern(/^([0-9][0-9]*):([0-5][0-9])$/)],
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
      this.timerStore.setBaseDuration((minutes * 60 + seconds) * 1000);
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

  deleteTask(taskId: string) {
    this.taskService.deleteTask(taskId);
  }

  formatMsToMmSs(ms: number): string {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
