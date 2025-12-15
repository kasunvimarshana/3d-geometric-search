import { Model } from "@core/entities/Model";
import { UUID, ModelData } from "@shared/types/interfaces";

/**
 * Repository interface for model persistence
 * Follows Interface Segregation Principle - clients depend only on what they need
 */
export interface IModelRepository {
  save(model: Model): Promise<void>;
  findById(id: UUID): Promise<Model | null>;
  delete(id: UUID): Promise<void>;
  getAll(): Promise<Model[]>;
}

/**
 * Loader interface for loading 3D models
 * Follows Dependency Inversion Principle - high-level modules depend on abstractions
 */
export interface IModelLoader {
  canLoad(format: string): boolean;
  load(file: File, onProgress?: (progress: number) => void): Promise<ModelData>;
}

/**
 * Renderer interface for 3D rendering
 */
export interface IRenderer {
  initialize(container: HTMLElement): void;
  dispose(): void;
  render(): void;
  resize(width: number, height: number): void;
  loadModel(model: Model): Promise<void>;
  unloadModel(): void;
  selectSections(sectionIds: UUID[]): void;
  highlightSection(sectionId: UUID | null): void;
  isolateSections(sectionIds: UUID[]): void;
  setSectionVisibility(sectionId: UUID, visible: boolean): void;
  resetCamera(): void;
  fitToScreen(): void;
  setViewMode(mode: string): void;
}

/**
 * Selection service interface
 */
export interface ISelectionService {
  select(sectionIds: UUID[]): void;
  deselect(sectionIds: UUID[]): void;
  clearSelection(): void;
  getSelected(): UUID[];
  isSelected(sectionId: UUID): boolean;
}

/**
 * Visibility service interface
 */
export interface IVisibilityService {
  show(sectionIds: UUID[]): void;
  hide(sectionIds: UUID[]): void;
  isolate(sectionIds: UUID[]): void;
  showAll(): void;
  isVisible(sectionId: UUID): boolean;
}
