import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../interfaces/task.interface';
import * as TasksActions from '../../store/actions/task.actions';
import * as TimerActions from '../../store/actions/timer.actions';
import { Store } from '@ngrx/store';
import { selectNewTaskTitle } from '../../store/selectors/task.selectors';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  newTaskTitle$: Observable<string>;

  constructor(private store: Store) {
    this.newTaskTitle$ = this.store.select(selectNewTaskTitle);
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(duration: number) {
    this.newTaskTitle$.subscribe(title => {
      if (title.trim()) {
        const newTask: Task = {
          id: Date.now().toString(),
          title: title.trim(),
          state: 'active',
          duration: duration,
          elapsedTime: 0,
          order: 0
        };
        this.store.dispatch(TasksActions.addTask({ task: newTask }));
        this.store.dispatch(TasksActions.setActiveTask({ taskId: newTask.id }));
        this.store.dispatch(TimerActions.startTimer({ duration: newTask.duration }));
        this.store.dispatch(TasksActions.setNewTaskTitle({ title: '' }));
        console.log('Task added:', newTask);
      }
    }).unsubscribe();
  }

  updateTask(updatedTask: Task): void {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.tasksSubject.next([...this.tasks]);
    }
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.tasksSubject.next([...this.tasks]);
  }
}
