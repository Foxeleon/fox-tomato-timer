import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient } from '@angular/common/http';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { BrowserPlatformAdapter, PLATFORM_ADAPTER } from './core/platform';
import { debugMetaReducer } from './store/logger.metareducer';
import { TimerState, TimerEffects, timerReducer } from './store/timer';
import { TaskState, TaskEffects, taskReducer } from './store/tasks';

export interface AppState {
  timer: TimerState;
  tasks: TaskState;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideAnimationsAsync(),
    provideStore(
      {
        timer: timerReducer,
        tasks: taskReducer,
      },
      { metaReducers: [debugMetaReducer] },
    ),
    provideEffects(TimerEffects, TaskEffects),
    provideHttpClient(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    {
      provide: PLATFORM_ADAPTER,
      useClass: BrowserPlatformAdapter,
    },
  ],
};
