/**
 * 3D Model
 * 
 * Core domain entity representing a complete 3D model.
 * Manages sections, hierarchy, and model-level properties.
 */

import { ModelSection, BoundingBox } from './ModelSection';

export enum ModelFormat {
  GLTF = 'gltf',
  GLB = 'glb',
  STEP = 'step',
  OBJ = 'obj',
  STL = 'stl',
  UNKNOWN = 'unknown',
}

export interface ModelMetadata {
  readonly filename: string;
  readonly format: ModelFormat;
  readonly fileSize: number;
  readonly loadedAt: Date;
  readonly vertexCount?: number;
  readonly triangleCount?: number;
}

export class Model {
  private readonly sections: Map<string, ModelSection> = new Map();
  private readonly rootSectionIds: string[] = [];

  constructor(
    public readonly metadata: ModelMetadata,
    private _boundingBox: BoundingBox | null = null
  ) {}

  get boundingBox(): BoundingBox | null {
    return this._boundingBox;
  }

  addSection(section: ModelSection): void {
    this.sections.set(section.id, section);
    
    if (section.parentId === null) {
      if (!this.rootSectionIds.includes(section.id)) {
        this.rootSectionIds.push(section.id);
      }
    }

    this.updateBoundingBox();
  }

  getSection(id: string): ModelSection | undefined {
    return this.sections.get(id);
  }

  getAllSections(): ModelSection[] {
    return Array.from(this.sections.values());
  }

  getRootSections(): ModelSection[] {
    return this.rootSectionIds
      .map((id) => this.sections.get(id))
      .filter((section): section is ModelSection => section !== undefined);
  }

  getChildSections(parentId: string): ModelSection[] {
    const parent = this.sections.get(parentId);
    if (!parent) return [];

    return parent.children
      .map((id) => this.sections.get(id))
      .filter((section): section is ModelSection => section !== undefined);
  }

  getSectionPath(id: string): ModelSection[] {
    const path: ModelSection[] = [];
    let current = this.sections.get(id);

    while (current) {
      path.unshift(current);
      current = current.parentId ? this.sections.get(current.parentId) : undefined;
    }

    return path;
  }

  clearSelection(): void {
    this.sections.forEach((section) => {
      if (section.isSelected) {
        section.isSelected = false;
      }
    });
  }

  clearHighlights(): void {
    this.sections.forEach((section) => {
      if (section.isHighlighted) {
        section.isHighlighted = false;
      }
    });
  }

  private updateBoundingBox(): void {
    const allBoxes = this.getAllSections()
      .map((s) => s.boundingBox)
      .filter((box): box is BoundingBox => box !== null);

    if (allBoxes.length === 0) {
      this._boundingBox = null;
      return;
    }

    const min = {
      x: Math.min(...allBoxes.map((b) => b.min.x)),
      y: Math.min(...allBoxes.map((b) => b.min.y)),
      z: Math.min(...allBoxes.map((b) => b.min.z)),
    };

    const max = {
      x: Math.max(...allBoxes.map((b) => b.max.x)),
      y: Math.max(...allBoxes.map((b) => b.max.y)),
      z: Math.max(...allBoxes.map((b) => b.max.z)),
    };

    this._boundingBox = { min, max };
  }
}
