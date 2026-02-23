import { Component } from '@angular/core';

import { TimerComponent } from './components/timer/timer.component';
import { TasksComponent } from './components/tasks/tasks.component';

@Component({
    selector: 'app-root',
    imports: [
    TimerComponent,
    TasksComponent
],
    template: `
    <div class="container mat-elevation-z2">
      <h1 class="mat-h1">{{ title }}</h1>
      <app-timer></app-timer>
      <app-tasks></app-tasks>
    </div>
  `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Fox Tomato Timer';
}
