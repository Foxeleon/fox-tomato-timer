import { Injectable } from '@angular/core';
import { PlatformAdapter } from '../platform.interface';

@Injectable()
export class TelegramMockAdapter implements PlatformAdapter {
  getPlatformName(): 'browser' | 'telegram' | 'extension' | 'android' {
    return 'telegram';
  }

  getInitData(): string | null {
    return 'mock_init_data_hash';
  }

  showAlert(message: string): void {
    console.log('[MockTelegram] showAlert:', message);
  }

  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    console.log('[MockTelegram] hapticFeedback:', type);
  }
}
