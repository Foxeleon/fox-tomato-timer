import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as TasksActions from '../../store/tasks/task.actions';
import {
  selectActiveTask,
  selectAllTasks,
  selectNewTaskTitle,
} from '../../store/tasks/task.selectors';
import { Observable, take } from 'rxjs';
import { ActiveTask, Task } from '../interfaces/task.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private store = inject(Store);

  // Facade methods for components - hide NgRx complexity
  getTasks(): Observable<Task[]> {
    return this.store.select(selectAllTasks);
  }

  getActiveTask(): Observable<ActiveTask | null> {
    return this.store.select(selectActiveTask);
  }

  getNewTaskTitle(): Observable<string> {
    return this.store.select(selectNewTaskTitle);
  }

  // Domain orchestration through facade
  addTask(duration: number): void {
    this.getNewTaskTitle()
      .pipe(take(1))
      .subscribe((title) => {
        if (title.trim()) {
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: title.trim(),
            state: 'pending',
            duration,
            elapsedTime: 0,
            order: 0,
          };

          this.store.dispatch(TasksActions.addTask({ task: newTask }));
          this.store.dispatch(TasksActions.setNewTaskTitle({ title: '' }));
          this.store.dispatch(TasksActions.setTaskInputActive({ isActive: false }));
        }
      });
  }

  deleteTask(taskId: string): void {
    // Infrastructure side effects only, without dispatch to prevent infinite loop
    try {
      console.log('Task deleted from storage:', taskId);
      // localStorage/API logic here
    } catch (error) {
      console.error('Error deleting task from storage:', error);
    }
  }

  // Other facade methods
  completeActiveTask(): void {
    this.store.dispatch(TasksActions.completeActiveTask());
  }

  setActiveTask(taskId: string): void {
    this.store.dispatch(TasksActions.setActiveTask({ taskId }));
  }

  patchTask(taskId: string, changes: Partial<Task | ActiveTask>): void {
    this.store.dispatch(TasksActions.patchTask({ taskId, changes }));
  }

  updateWholeTask(updatedTask: Task): void {
    this.store.dispatch(TasksActions.updateTask({ task: updatedTask }));
  }
}
