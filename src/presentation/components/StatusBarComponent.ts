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
    this.statusText.textContent = message;
    this.statusText.className = `status-text status-${type}`;
  }

  setModelInfo(info: string): void {
    this.modelInfo.textContent = info;
  }

  clearModelInfo(): void {
    this.modelInfo.textContent = '';
  }
}
