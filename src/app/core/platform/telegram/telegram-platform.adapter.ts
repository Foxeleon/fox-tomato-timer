import { Injectable } from '@angular/core';
import { PlatformAdapter } from '../platform.interface';

interface TelegramWebApp {
  initData: string;
  showAlert: (message: string) => void;
  HapticFeedback: {
    impactOccurred: (style: string) => void;
  };
}

@Injectable()
export class TelegramPlatformAdapter implements PlatformAdapter {
  private readonly webApp = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } })
    .Telegram?.WebApp;

  constructor() {
    if (!this.webApp) {
      console.warn('Telegram WebApp API is not available.');
    }
  }

  getPlatformName(): 'browser' | 'telegram' | 'extension' | 'android' {
    return 'telegram';
  }

  getInitData(): string | null {
    return this.webApp?.initData ?? null;
  }

  showAlert(message: string): void {
    if (this.webApp?.showAlert) {
      this.webApp.showAlert(message);
    } else {
      window.alert(message);
    }
  }

  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    if (this.webApp?.HapticFeedback) {
      this.webApp.HapticFeedback.impactOccurred(type);
    }
  }
}
