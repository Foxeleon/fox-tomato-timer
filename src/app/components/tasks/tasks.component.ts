import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Observable, Subscription, take, tap } from 'rxjs';
import { Task } from '../../shared/interfaces/task.interface';
import * as TasksActions from '../../store/actions/task.actions';
import { selectNewTaskTitle } from '../../store/selectors/task.selectors';
import { MatCheckbox } from '@angular/material/checkbox';
import { TaskService } from '../../shared/services/task.service';
import { TimerService } from '../../shared/services/timer.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    DragDropModule,
    MatCheckbox
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
  animations: [
    trigger('dragAnimation', [
      state('idle', style({
        transform: 'scale(1)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      })),
      state('dragging', style({
        transform: 'scale(1.05)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
      })),
      transition('idle => dragging', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      transition('dragging => idle', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks$: Observable<Task[]>;
  tasks: Task[] = [];
  activeTask$: Observable<Task | null>;
  duration$: Observable<number>;
  newTaskTitle$: Observable<string>;

  private duration: number; // Значение по умолчанию (25 минут)
  private readonly durationSubscription: Subscription;

  constructor(private store: Store, private taskService: TaskService, private timerService: TimerService) {
    this.tasks$ = this.taskService.getTasks();
    this.tasks$.subscribe(tasks => this.tasks = tasks);
    this.activeTask$ = this.taskService.getActiveTaskObservable();
    this.duration$ = this.timerService.getDurationObservable();
    this.newTaskTitle$ = this.store.select(selectNewTaskTitle);

    this.duration = this.timerService.getDuration();
    this.durationSubscription = this.timerService.getDurationObservable().subscribe(duration => {
      this.duration = duration;
    });
    this.durationSubscription = this.timerService.getDurationObservable().subscribe(duration => {
      this.duration = duration;
    });
  }

  ngOnInit() {
    this.store.dispatch(TasksActions.loadTasks());
  }

  ngOnDestroy() {
    if (this.durationSubscription) {
      this.durationSubscription.unsubscribe();
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
    // Создаем новый массив и перемещаем элементы внутри.
    if (event.previousIndex !== event.currentIndex) {
      const updatedTasks = [...this.tasks]; // Копируем массив
      const [movedTask] = updatedTasks.splice(event.previousIndex, 1); // Удаляем элемент
      updatedTasks.splice(event.currentIndex, 0, movedTask); // Вставляем на новое место
      this.tasks = updatedTasks; // Обновляем массив
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

  onDrop(event: CdkDragDrop<Task[]>) {
    this.tasks$.pipe(
      take(1),
      tap(tasks => {
        const newTasks = [...tasks];
        moveItemInArray(newTasks, event.previousIndex, event.currentIndex);
        const updatedTasks = newTasks.map((task, index) => ({ ...task, order: index }));
        this.store.dispatch(TasksActions.updateTaskOrder({ tasks: updatedTasks }));
      })
    ).subscribe();
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

  formatTaskElapsedTime(duration: number): string {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
