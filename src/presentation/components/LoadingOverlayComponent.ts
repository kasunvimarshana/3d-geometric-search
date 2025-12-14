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
    try {
      if (!this.overlay) {
        console.error('[LoadingOverlay] Overlay element not available');
        return;
      }

      const textElement = this.overlay.querySelector('.loading-text');
      if (textElement) {
        textElement.textContent = message;
      }
      this.overlay.classList.remove('hidden');
    } catch (error) {
      console.error('[LoadingOverlay] Error showing overlay:', error);
    }
  }

  hide(): void {
    try {
      if (!this.overlay) {
        console.error('[LoadingOverlay] Overlay element not available');
        return;
      }

      this.overlay.classList.add('hidden');
    } catch (error) {
      console.error('[LoadingOverlay] Error hiding overlay:', error);
    }
  }

  updateMessage(message: string): void {
    try {
      if (!this.overlay) {
        console.error('[LoadingOverlay] Overlay element not available');
        return;
      }

      const textElement = this.overlay.querySelector('.loading-text');
      if (textElement) {
        textElement.textContent = message;
      } else {
        console.warn('[LoadingOverlay] Loading text element not found');
      }
    } catch (error) {
      console.error('[LoadingOverlay] Error updating message:', error);
    }
  }
}
