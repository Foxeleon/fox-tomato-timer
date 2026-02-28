import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span class="title">{{ title }}</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/dashboard" routerLinkActive="mat-mdc-button-active">Dashboard</a>
      <a mat-button routerLink="/statistics" routerLinkActive="mat-mdc-button-active">Statistics</a>
      <a mat-button routerLink="/categories" routerLinkActive="mat-mdc-button-active">Categories</a>
    </mat-toolbar>
    <div class="container mat-elevation-z2">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Fox Tomato Timer';
}
