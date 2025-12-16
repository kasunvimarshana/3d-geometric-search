import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModelRegistry } from '../../core/registry/ModelRegistry';
import { fitToObject } from '../../core/services/fitView';

export interface CameraState {
  position?: number[];
  target?: number[];
}

export interface ViewerState {
  canvasReady: boolean;
  fullscreen: boolean;
  camera: CameraState | null;
}

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private stateSubject = new BehaviorSubject<ViewerState>({
    canvasReady: false,
    fullscreen: false,
    camera: this.loadSavedCamera()
  });

  public state$: Observable<ViewerState> = this.stateSubject.asObservable();

  get currentState(): ViewerState {
    return this.stateSubject.value;
  }

  private loadSavedCamera(): CameraState | null {
    try {
      const raw = localStorage.getItem('viewer.camera.v1');
      if (!raw) return null;
      const cam = JSON.parse(raw);
      if (cam && Array.isArray(cam.position) && Array.isArray(cam.target)) {
        return cam;
      }
    } catch {}
    return null;
  }

  setCanvasReady(ready: boolean): void {
    this.updateState({ canvasReady: ready });
  }

  setCamera(position?: number[], target?: number[]): void {
    const camera: CameraState = {
      position: Array.isArray(position) ? position : this.currentState.camera?.position,
      target: Array.isArray(target) ? target : this.currentState.camera?.target
    };
    this.updateState({ camera });
    
    // Persist to localStorage
    try {
      const data = JSON.stringify(camera);
      localStorage.setItem('viewer.camera.v1', data);
    } catch {}
  }

  clearCamera(): void {
    this.updateState({ camera: null });
    try {
      localStorage.removeItem('viewer.camera.v1');
    } catch {}
  }

  fitToSelection(): void {
    const root = ModelRegistry.getRoot();
    if (!root) return;
    const target = ModelRegistry.getSelectionOrRoot();
    fitToObject(target);
  }

  fitToAll(): void {
    const root = ModelRegistry.getRoot();
    if (!root) return;
    fitToObject(root);
  }

  toggleFullscreen(): void {
    this.updateState({ fullscreen: !this.currentState.fullscreen });
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  resetView(): void {
    ModelRegistry.resetTransforms();
    const root = ModelRegistry.getRoot();
    if (root) {
      fitToObject(root);
    }
  }

  private updateState(partial: Partial<ViewerState>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...partial
    });
  }
}
