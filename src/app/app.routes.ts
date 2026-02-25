import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'timer', pathMatch: 'full' },
  {
    path: 'timer',
    loadComponent: () => import('./components/timer/timer.component').then(m => m.TimerComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./components/statistics/statistics.component').then(m => m.StatisticsComponent)
  }
];
