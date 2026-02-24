import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, CdkDragSortEvent, DragDropModule } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Task } from '../../shared/interfaces/task.interface';
import * as TasksActions from '../../store/actions/task.actions';
import { selectNewTaskTitle } from '../../store/selectors/task.selectors';
import { TaskService } from '../../shared/services/task.service';
import { TimerService } from '../../shared/services/timer.service';
import { animate, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-tasks',
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        DragDropModule
    ],
    templateUrl: './tasks.component.html',
    styleUrl: './tasks.component.scss',
    animations: [
        trigger('dragAnimation', [
            transition('idle => draggingUp', animate('200ms ease-in-out')),
            transition('idle => draggingDown', animate('200ms ease-in-out')),
            transition('draggingUp => idle', animate('200ms ease-in')),
            transition('draggingDown => idle', animate('200ms ease-in'))
        ])
    ]
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks$: Observable<Task[]>;
  tasks: Task[] = [];
  activeTask$: Observable<Task | null>;
  newTaskTitle$: Observable<string>;
  draggedDirection: 'draggingUp' | 'draggingDown' | 'idle' = 'idle';

  private duration: number; // Значение по умолчанию (25 минут)
  remainingTime: number; // Значение по умолчанию (25 минут)
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private store: Store, private taskService: TaskService, private timerService: TimerService) {
    this.tasks$ = this.taskService.getTasks();
    this.tasks$.subscribe(tasks => this.tasks = tasks);
    this.activeTask$ = this.taskService.getActiveTaskObservable();
    this.newTaskTitle$ = this.store.select(selectNewTaskTitle);

    this.duration = this.timerService.getDuration();
    this.remainingTime = this.timerService.getRemainingTime();
    this.subscriptions.add(this.timerService.getDurationObservable().subscribe(duration => {
      this.duration = duration;
    }));
    this.subscriptions.add(this.timerService.getRemainingTimeObservable().subscribe(remainingTime => {
      this.remainingTime = remainingTime;
    }));
  }

  ngOnInit() {
    this.store.dispatch(TasksActions.loadTasks());
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onTaskInputChange(title: string) {
    this.store.dispatch(TasksActions.setNewTaskTitle({ title }));
    this.store.dispatch(TasksActions.setTaskInputActive({ isActive: title.trim().length > 0 }));
  }

  addTask() {
    if(!this.taskService.getActiveTask()) this.taskService.addTask(this.duration);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const updatedTasks = [...this.tasks];
      const [movedTask] = updatedTasks.splice(event.previousIndex, 1); // Удаляем
      updatedTasks.splice(event.currentIndex, 0, movedTask); // Вставляем
      this.tasks = updatedTasks;
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
      task.title = updatedTitle.trim(); // Обновляем название задачи
    }
  }

  completeTask(task: Task) {
    if (task.state === 'active') {
      this.store.dispatch(TasksActions.completeActiveTask());
    } else
    if (task.state !== 'completed') {
      this.taskService.patchTask(task.id, {state: 'completed'});
    }
  }

  deleteTask(taskId: string) {
    this.taskService.deleteTask(taskId);
  }

  getTaskIcon(task: Task): string {
    switch (task.state) {
      case 'active':
        return 'play_arrow';
      case 'paused':
        return 'pause';
      case 'completed':
        return 'check';
      default:
        return 'radio_button_unchecked';
    }
  }

  formatTime(duration: number): string {
    return this.timerService.formatTime(duration);
  }

}
