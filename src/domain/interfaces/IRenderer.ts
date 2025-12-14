/**
 * Renderer Interface
 *
 * Contract for 3D scene rendering.
 * Abstracts rendering engine details from the domain.
 */

import { Model } from '../models/Model';
import { ModelSection } from '../models/ModelSection';

export interface RenderOptions {
  readonly wireframe?: boolean;
  readonly showGrid?: boolean;
  readonly showAxes?: boolean;
}

export interface CameraPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface IRenderer {
  initialize(container: HTMLElement): Promise<void>;
  dispose(): void;

  render(): void;
  resize(): void;

  loadModel(model: Model, threeJsObject?: unknown): Promise<void>;
  clearScene(): void;

  highlightSection(section: ModelSection): void;
  clearHighlight(): void;

  focusOnSection(section: ModelSection): void;
  resetCamera(): void;
  fitToView(): void;

  setWireframe(enabled: boolean): void;
  setGridVisible(visible: boolean): void;
  setAxesVisible(visible: boolean): void;

  zoomIn(): void;
  zoomOut(): void;

  getCameraPosition(): CameraPosition;
  setCameraPosition(position: CameraPosition): void;

  enableClickHandling(
    onSectionClick: (sectionId: string, event: MouseEvent) => void,
    onViewportClick: (event: MouseEvent) => void
  ): void;
  disableClickHandling(): void;
}
