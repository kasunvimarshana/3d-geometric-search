/**
 * Status Bar Component
 *
 * Displays application status and model information.
 * Shows messages, errors, and statistics.
 */

export class StatusBarComponent {
  private statusText: HTMLElement;
  private modelInfo: HTMLElement;

  constructor(statusTextId: string, modelInfoId: string) {
    const statusEl = document.getElementById(statusTextId);
    const infoEl = document.getElementById(modelInfoId);

    if (!statusEl || !infoEl) {
      throw new Error('Status bar elements not found');
    }

    this.statusText = statusEl;
    this.modelInfo = infoEl;
  }

  setStatus(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    try {
      if (!this.statusText) {
        console.error('[StatusBar] Status text element not available');
        return;
      }

      this.statusText.textContent = message || '';
      this.statusText.className = `status-text status-${type}`;
    } catch (error) {
      console.error('[StatusBar] Error setting status:', error);
    }
  }

  setModelInfo(info: string): void {
    try {
      if (!this.modelInfo) {
        console.error('[StatusBar] Model info element not available');
        return;
      }

      this.modelInfo.textContent = info || '';
    } catch (error) {
      console.error('[StatusBar] Error setting model info:', error);
    }
  }

  clearModelInfo(): void {
    try {
      if (!this.modelInfo) {
        console.error('[StatusBar] Model info element not available');
        return;
      }

      this.modelInfo.textContent = '';
    } catch (error) {
      console.error('[StatusBar] Error clearing model info:', error);
    }
  }
}
