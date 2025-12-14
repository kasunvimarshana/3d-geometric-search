/**
 * Loading Overlay Component
 * 
 * Shows/hides loading state with spinner.
 * Provides user feedback during model loading.
 */

export class LoadingOverlayComponent {
  private overlay: HTMLElement;

  constructor(overlayId: string) {
    const element = document.getElementById(overlayId);
    if (!element) {
      throw new Error(`Overlay element not found: ${overlayId}`);
    }
    this.overlay = element;
  }

  show(message = 'Loading...'): void {
    const textElement = this.overlay.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = message;
    }
    this.overlay.classList.remove('hidden');
  }

  hide(): void {
    this.overlay.classList.add('hidden');
  }

  updateMessage(message: string): void {
    const textElement = this.overlay.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = message;
    }
  }
}
