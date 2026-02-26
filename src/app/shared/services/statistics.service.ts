import { Injectable } from '@angular/core';
import { TaskService } from './task.service';
import { CategoryService } from './category.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../interfaces/task.interface';
import { Category } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
  ) {}

  getTasksPerCategory(): Observable<{ category: string; count: number }[]> {
    return combineLatest([this.taskService.getTasks(), this.categoryService.getCategories()]).pipe(
      map(([tasks, categories]) => {
        return categories.map((category) => ({
          category: category.name,
          count: tasks.filter((task) => task.categoryId === category.id).length,
        }));
      }),
    );
  }

  getTotalCompletedTasks(): Observable<number> {
    return this.taskService
      .getTasks()
      .pipe(map((tasks) => tasks.filter((task) => task.completed).length));
  }
}
