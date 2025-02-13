import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActiveTask, Task } from '../interfaces/task.interface';
import * as TasksActions from '../../store/actions/task.actions';
import * as TimerActions from '../../store/actions/timer.actions';
import { Store } from '@ngrx/store';
import { selectActiveTask, selectAllTasks, selectNewTaskTitle } from '../../store/selectors/task.selectors';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  newTaskTitle$: Observable<string>;
  activeTask$: Observable<ActiveTask | null>;
  activeTask: ActiveTask | null;

  constructor(private store: Store) {
    this.newTaskTitle$ = this.store.select(selectNewTaskTitle);
    this.activeTask$ = this.store.select(selectActiveTask);
    this.store.select(selectAllTasks).subscribe(tasks => {
      this.tasks = tasks;
      this.tasksSubject.next(tasks);
    });
    this.activeTask = null
    this.activeTask$.subscribe(task => this.activeTask = task);
  }

  getActiveTaskObservable(): Observable<ActiveTask | null> {
    return this.activeTask$;
  }

  getActiveTask(): ActiveTask | null {
    return this.activeTask;
  }

  setActiveTask(taskId: string) {
    this.store.dispatch(TasksActions.setActiveTask({ taskId }));
  }

  patchTask(taskId: string, changes: Partial<Task | ActiveTask>) {
    this.store.dispatch(TasksActions.patchTask({ taskId, changes }));
  }

  // TODO rewrite function with logic of ngrx store
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
        if (this.activeTask === null) {
          this.setActiveTask(newTask.id);
          this.store.dispatch(TimerActions.startTimer({ duration: newTask.duration }));
        }
        // reset state of input field
        this.store.dispatch(TasksActions.setNewTaskTitle({ title: '' }));
        this.store.dispatch(TasksActions.setTaskInputActive({ isActive: false }));
      }
    }).unsubscribe();
  }

  // TODO rewrite function with logic of ngrx store
  updateTask(updatedTask: Task): void {
    this.store.dispatch(TasksActions.updateTask({task: updatedTask}));
    // const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    // if (index !== -1) {
    //   this.tasks[index] = updatedTask;
    //   this.tasksSubject.next([...this.tasks]);
    // }
  }

  // TODO rewrite function with logic of ngrx store
  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.tasksSubject.next([...this.tasks]);
  }
}
