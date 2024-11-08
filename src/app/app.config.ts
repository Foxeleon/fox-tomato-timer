import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { timerReducer } from './store/reducers/timer.reducer';
import { provideEffects } from '@ngrx/effects';
import { TimerEffects } from './store/effects/timer.effects';

export const appConfig: ApplicationConfig = {
  providers:
    [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideAnimationsAsync(),
      provideStore({ timer: timerReducer }),
      provideEffects([TimerEffects])
]
};
