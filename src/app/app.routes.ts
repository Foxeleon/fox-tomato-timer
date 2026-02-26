import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'timer', pathMatch: 'full' },
  {
    path: 'timer',
    loadComponent: () => import('./components/timer/timer.component').then((m) => m.TimerComponent),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/tasks.component').then((m) => m.TasksComponent),
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./components/statistics/statistics.component').then((m) => m.StatisticsComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/categories/categories.component').then((m) => m.CategoriesComponent),
  },
  { path: '**', redirectTo: 'timer' },
];
