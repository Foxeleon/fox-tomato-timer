import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TimerComponent } from './components/timer/timer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TimerComponent],
  template: `
    <div class="container mat-elevation-z2">
      <h1 class="mat-h1">{{ title }}</h1>
      <app-timer></app-timer>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Fox Tomato Timer';
}
