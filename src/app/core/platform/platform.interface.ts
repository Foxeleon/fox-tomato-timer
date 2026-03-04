export interface PlatformAdapter {
  getInitData(): string | null;
  showAlert(message: string): void;
  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void;
  getPlatformName(): 'browser' | 'telegram' | 'extension' | 'android';
}
