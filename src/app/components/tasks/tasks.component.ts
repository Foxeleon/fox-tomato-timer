import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Task } from '../../shared/interfaces/task.interface';
import * as TasksActions from '../../store/actions/task.actions';
import { selectAllTasks, selectActiveTask, selectNewTaskTitle } from '../../store/selectors/task.selectors';
import { MatCheckbox } from '@angular/material/checkbox';
import { selectDuration } from '../../store/selectors/timer.selectors';
import { TaskService } from '../../shared/services/task.service';
import { TimerService } from '../../shared/services/timer.service';

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
  styleUrl: './tasks.component.scss'
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks$: Observable<Task[]>;
  activeTask$: Observable<Task | null>;
  duration$: Observable<number>;
  newTaskTitle$: Observable<string>;

  private duration: number; // Значение по умолчанию (25 минут)
  private readonly durationSubscription: Subscription;

  constructor(private store: Store, private taskService: TaskService, private timerService: TimerService) {
    this.tasks$ = this.store.select(selectAllTasks);
    this.activeTask$ = this.taskService.getActiveTaskObservable();
    this.duration$ = this.store.select(selectDuration);
    this.newTaskTitle$ = this.store.select(selectNewTaskTitle);

    this.duration = this.timerService.getDuration();
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
    this.taskService.addTask(this.duration);
  }

  completeTask(task: Task) {
    if (task.state === 'active') {
      this.store.dispatch(TasksActions.completeActiveTask());
    } else
    if (task.state !== 'completed') {
      const completedTask: Task = {
        ...task,
        state: 'completed'
      };
      this.store.dispatch(TasksActions.updateTask({ task: completedTask }));
    }
  }

  deleteTask(taskId: string) {
    this.store.dispatch(TasksActions.deleteTask({ id: taskId }));
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    this.tasks$.subscribe(tasks => {
      const newTasks = [...tasks];
      moveItemInArray(newTasks, event.previousIndex, event.currentIndex);
      const updatedTasks = newTasks.map((task, index) => ({ ...task, order: index }));
      this.store.dispatch(TasksActions.updateTaskOrder({ tasks: updatedTasks }));
    });
  }

  getTaskIcon(task: Task): string {
    switch (task.state) {
      case 'active':
        return 'pause';
      case 'paused':
        return 'play_arrow';
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
