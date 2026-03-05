import { InjectionToken } from '@angular/core';
import { PlatformAdapter } from './platform.interface';

export const PLATFORM_ADAPTER = new InjectionToken<PlatformAdapter>('PLATFORM_ADAPTER');
