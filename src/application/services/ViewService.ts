/**
 * View Service
 *
 * Manages view state and camera operations.
 * Coordinates view-related actions with the renderer.
 */

import { IRenderer } from '@domain/interfaces/IRenderer';
import { IEventBus } from '@domain/interfaces/IEventBus';
import {
  ViewResetEvent,
  DisplayOptionChangedEvent,
  ViewFullscreenEvent,
  ViewFullscreenErrorEvent,
} from '@domain/events/DomainEvents';

export interface ViewState {
  wireframe: boolean;
  showGrid: boolean;
  showAxes: boolean;
  isFullscreen: boolean;
}

export class ViewService {
  private state: ViewState = {
    wireframe: false,
    showGrid: true,
    showAxes: true,
    isFullscreen: false,
  };

  constructor(
    private readonly renderer: IRenderer,
    private readonly eventBus: IEventBus
  ) {}

  resetView(): void {
    try {
      this.renderer.resetCamera();
      this.eventBus.publish(new ViewResetEvent());
    } catch (error) {
      console.error('[ViewService] Error resetting view:', error);
    }
  }

  fitToView(): void {
    try {
      this.renderer.fitToView();
    } catch (error) {
      console.error('[ViewService] Error fitting to view:', error);
    }
  }

  zoomIn(): void {
    try {
      this.renderer.zoomIn();
    } catch (error) {
      console.error('[ViewService] Error zooming in:', error);
    }
  }

  zoomOut(): void {
    try {
      this.renderer.zoomOut();
    } catch (error) {
      console.error('[ViewService] Error zooming out:', error);
    }
  }

  setWireframe(enabled: boolean): void {
    try {
      this.state.wireframe = enabled;
      this.renderer.setWireframe(enabled);
      this.publishDisplayChange('wireframe', enabled);
    } catch (error) {
      console.error('[ViewService] Error setting wireframe:', error);
    }
  }

  setGridVisible(visible: boolean): void {
    try {
      this.state.showGrid = visible;
      this.renderer.setGridVisible(visible);
      this.publishDisplayChange('grid', visible);
    } catch (error) {
      console.error('[ViewService] Error setting grid visibility:', error);
    }
  }

  setAxesVisible(visible: boolean): void {
    try {
      this.state.showAxes = visible;
      this.renderer.setAxesVisible(visible);
      this.publishDisplayChange('axes', visible);
    } catch (error) {
      console.error('[ViewService] Error setting axes visibility:', error);
    }
  }

  async toggleFullscreen(element: HTMLElement): Promise<void> {
    if (!element) {
      const error = new Error('No element provided for fullscreen');
      this.eventBus.publish(new ViewFullscreenErrorEvent({ error }));
      throw error;
    }

    try {
      if (!document.fullscreenElement) {
        // Check if fullscreen is supported
        if (!element.requestFullscreen) {
          throw new Error('Fullscreen API not supported by browser');
        }

        await element.requestFullscreen();
        this.state.isFullscreen = true;
      } else {
        await document.exitFullscreen();
        this.state.isFullscreen = false;
      }

      // Resize renderer after fullscreen change
      setTimeout(() => {
        try {
          this.renderer.resize();
        } catch (error) {
          console.error('[ViewService] Error resizing after fullscreen:', error);
        }
      }, 100);

      // Publish fullscreen event
      this.eventBus.publish(new ViewFullscreenEvent({ enabled: this.state.isFullscreen }));
    } catch (error) {
      console.error('[ViewService] Fullscreen error:', error);
      this.state.isFullscreen = false;

      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish(new ViewFullscreenErrorEvent({ error: errorObj }));

      throw error;
    }
  }

  getState(): Readonly<ViewState> {
    return { ...this.state };
  }

  private publishDisplayChange(option: string, value: boolean): void {
    try {
      this.eventBus.publish(new DisplayOptionChangedEvent({ option, value }));
    } catch (error) {
      console.error('[ViewService] Error publishing display change:', error);
    }
  }
}
