import {
  UUID,
  ModelData,
  ModelMetadata,
  BoundingBox,
  GeometryProperties,
  MaterialProperties,
} from "@shared/types/interfaces";
import { Section } from "./Section";
import { generateId } from "@shared/utils/helpers";

/**
 * Model entity representing a complete 3D model
 * Follows Single Responsibility Principle - manages model data and hierarchy
 */
export class Model {
  private readonly _id: UUID;
  private _metadata: ModelMetadata;
  private _sections: Map<UUID, Section>;
  private _rootSectionIds: Set<UUID>;
  private _geometries: Map<UUID, GeometryProperties>;
  private _materials: Map<UUID, MaterialProperties>;
  private _boundingBox?: BoundingBox;

  constructor(metadata: Omit<ModelMetadata, "id">) {
    this._id = generateId();
    this._metadata = { ...metadata, id: this._id };
    this._sections = new Map();
    this._rootSectionIds = new Set();
    this._geometries = new Map();
    this._materials = new Map();
  }

  // Getters
  get id(): UUID {
    return this._id;
  }

  get metadata(): ModelMetadata {
    return this._metadata;
  }

  get sections(): Map<UUID, Section> {
    return this._sections;
  }

  get rootSectionIds(): UUID[] {
    return Array.from(this._rootSectionIds);
  }

  get boundingBox(): BoundingBox | undefined {
    return this._boundingBox;
  }

  // Section management
  addSection(section: Section): void {
    this._sections.set(section.id, section);
    if (!section.parentId) {
      this._rootSectionIds.add(section.id);
    }
  }

  removeSection(sectionId: UUID): void {
    const section = this._sections.get(sectionId);
    if (!section) return;

    // Remove from parent's children
    if (section.parentId) {
      const parent = this._sections.get(section.parentId);
      parent?.removeChild(sectionId);
    } else {
      this._rootSectionIds.delete(sectionId);
    }

    // Recursively remove children
    section.children.forEach((childId) => this.removeSection(childId));

    this._sections.delete(sectionId);
  }

  getSection(sectionId: UUID): Section | undefined {
    return this._sections.get(sectionId);
  }

  getSectionsByParentId(parentId?: UUID): Section[] {
    if (!parentId) {
      return Array.from(this._rootSectionIds)
        .map((id) => this._sections.get(id))
        .filter((s): s is Section => s !== undefined);
    }

    const parent = this._sections.get(parentId);
    if (!parent) return [];

    return parent.children
      .map((id) => this._sections.get(id))
      .filter((s): s is Section => s !== undefined);
  }

  getAllSections(): Section[] {
    return Array.from(this._sections.values());
  }

  // Hierarchy traversal
  getAncestors(sectionId: UUID): Section[] {
    const ancestors: Section[] = [];
    let current = this._sections.get(sectionId);

    while (current?.parentId) {
      const parent = this._sections.get(current.parentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return ancestors;
  }

  getDescendants(sectionId: UUID): Section[] {
    const descendants: Section[] = [];
    const section = this._sections.get(sectionId);
    if (!section) return descendants;

    const traverse = (sec: Section) => {
      sec.children.forEach((childId) => {
        const child = this._sections.get(childId);
        if (child) {
          descendants.push(child);
          traverse(child);
        }
      });
    };

    traverse(section);
    return descendants;
  }

  // Geometry management
  addGeometry(id: UUID, geometry: GeometryProperties): void {
    this._geometries.set(id, geometry);
  }

  getGeometry(id: UUID): GeometryProperties | undefined {
    return this._geometries.get(id);
  }

  // Material management
  addMaterial(id: UUID, material: MaterialProperties): void {
    this._materials.set(id, material);
  }

  getMaterial(id: UUID): MaterialProperties | undefined {
    return this._materials.get(id);
  }

  // Bounding box
  setBoundingBox(boundingBox: BoundingBox): void {
    this._boundingBox = boundingBox;
  }

  // Serialization
  toJSON(): ModelData {
    return {
      metadata: this._metadata,
      sections: new Map(
        Array.from(this._sections.entries()).map(([id, section]) => [
          id,
          section.toJSON(),
        ])
      ),
      geometries: this._geometries,
      materials: this._materials,
      rootSectionIds: this.rootSectionIds,
      boundingBox: this._boundingBox!,
    };
  }
}
