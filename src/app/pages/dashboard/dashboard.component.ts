import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TimerComponent } from '../../components/timer/timer.component';
import { TasksComponent } from '../../components/tasks/tasks.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimerComponent, TasksComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {}
