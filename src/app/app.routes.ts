import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
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
  { path: '**', redirectTo: 'dashboard' },
];
