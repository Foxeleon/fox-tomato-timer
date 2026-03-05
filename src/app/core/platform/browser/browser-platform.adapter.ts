import { Injectable } from '@angular/core';
import { PlatformAdapter } from '../platform.interface';

@Injectable()
export class BrowserPlatformAdapter implements PlatformAdapter {
  getPlatformName(): 'browser' | 'telegram' | 'extension' | 'android' {
    return 'browser';
  }

  getInitData(): string | null {
    return null;
  }

  showAlert(message: string): void {
    window.alert(message);
  }

  hapticFeedback(_type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    // The browser does not support Haptic Feedback, so the method is intentionally empty.
  }
}
