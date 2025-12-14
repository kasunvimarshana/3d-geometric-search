/**
 * View Service
 * 
 * Manages view state and camera operations.
 * Coordinates view-related actions with the renderer.
 */

import { IRenderer } from '@domain/interfaces/IRenderer';
import { IEventBus } from '@domain/interfaces/IEventBus';
import { ViewResetEvent, EventType } from '@domain/events/DomainEvents';

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
    this.renderer.resetCamera();
    this.eventBus.publish(new ViewResetEvent());
  }

  fitToView(): void {
    this.renderer.fitToView();
  }

  zoomIn(): void {
    this.renderer.zoomIn();
  }

  zoomOut(): void {
    this.renderer.zoomOut();
  }

  setWireframe(enabled: boolean): void {
    this.state.wireframe = enabled;
    this.renderer.setWireframe(enabled);
    this.publishDisplayChange('wireframe', enabled);
  }

  setGridVisible(visible: boolean): void {
    this.state.showGrid = visible;
    this.renderer.setGridVisible(visible);
    this.publishDisplayChange('grid', visible);
  }

  setAxesVisible(visible: boolean): void {
    this.state.showAxes = visible;
    this.renderer.setAxesVisible(visible);
    this.publishDisplayChange('axes', visible);
  }

  async toggleFullscreen(element: HTMLElement): Promise<void> {
    if (!document.fullscreenElement) {
      await element.requestFullscreen();
      this.state.isFullscreen = true;
    } else {
      await document.exitFullscreen();
      this.state.isFullscreen = false;
    }
    
    // Resize renderer after fullscreen change
    setTimeout(() => this.renderer.resize(), 100);
  }

  getState(): Readonly<ViewState> {
    return { ...this.state };
  }

  private publishDisplayChange(option: string, value: boolean): void {
    this.eventBus.publish({
      type: EventType.DISPLAY_OPTION_CHANGED,
      timestamp: new Date(),
      payload: { option, value },
    });
  }
}
