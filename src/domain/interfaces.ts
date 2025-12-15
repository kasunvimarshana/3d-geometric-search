import { Model, ModelFormat, ApplicationState } from "./types";
import { ApplicationEvent } from "./events";

/**
 * Interface for model loaders
 * Follows Strategy pattern for different format support
 */
export interface IModelLoader {
  readonly supportedFormats: ModelFormat[];
  canLoad(format: ModelFormat): boolean;
  load(data: ArrayBuffer | string, filename: string): Promise<Model>;
}

/**
 * Interface for model repository
 * Follows Repository pattern for data access
 */
export interface IModelRepository {
  save(model: Model): void;
  findById(id: string): Model | undefined;
  getCurrent(): Model | undefined;
  clear(): void;
}

/**
 * Interface for state manager
 * Manages application state with immutability
 */
export interface IStateManager {
  getState(): Readonly<ApplicationState>;
  updateState(updater: (state: ApplicationState) => ApplicationState): void;
  subscribe(listener: (state: ApplicationState) => void): () => void;
  reset(): void;
}

/**
 * Interface for event bus
 * Centralized event orchestration following Observer pattern
 */
export interface IEventBus {
  publish(event: ApplicationEvent): void;
  subscribe(
    eventType: ApplicationEvent["type"],
    handler: (event: ApplicationEvent) => void
  ): () => void;
  subscribeAll(handler: (event: ApplicationEvent) => void): () => void;
  clear(): void;
}

/**
 * Interface for 3D renderer
 * Abstracts rendering engine details
 */
export interface IRenderer {
  initialize(container: HTMLElement): void;
  loadModel(model: Model): void;
  updateSection(
    sectionId: string,
    properties: Partial<{ visible: boolean; highlighted: boolean }>
  ): void;
  highlightSection(sectionId: string, animated?: boolean): void;
  dehighlightSection(sectionId: string, animated?: boolean): void;
  focusSection(sectionId: string, animated?: boolean): void;
  isolateSections(sectionIds: string[]): void;
  showAllSections(): void;
  resetView(animated?: boolean): void;
  fitToScreen(animated?: boolean, margin?: number): void;
  zoom(
    delta: number,
    point?: { x: number; y: number },
    animated?: boolean
  ): void;
  scaleModel(scaleFactor: number, animated?: boolean): void;
  setFullscreen(enabled: boolean): void;
  dispose(): void;
  render(): void;
}

/**
 * Interface for animation controller
 * Manages model animations (disassembly, reassembly)
 */
export interface IAnimationController {
  disassemble(duration?: number): Promise<void>;
  reassemble(duration?: number): Promise<void>;
  stop(): void;
  isAnimating(): boolean;
}

/**
 * Interface for section manager
 * Manages section hierarchy and operations
 */
export interface ISectionManager {
  getSectionById(
    id: string
  ): Model["sections"] extends Map<string, infer S> ? S : never;
  getParentSection(
    sectionId: string
  ): Model["sections"] extends Map<string, infer S> ? S | undefined : never;
  getChildSections(
    sectionId: string
  ): Array<Model["sections"] extends Map<string, infer S> ? S : never>;
  getRootSections(): Array<
    Model["sections"] extends Map<string, infer S> ? S : never
  >;
  selectSection(sectionId: string, multi?: boolean): void;
  deselectSection(sectionId?: string): void;
  getSelectedSections(): string[];
}

/**
 * Interface for file handler
 * Handles file upload and format detection
 */
export interface IFileHandler {
  detectFormat(filename: string): ModelFormat | undefined;
  readFile(file: File): Promise<ArrayBuffer | string>;
  isFormatSupported(format: ModelFormat): boolean;
}

/**
 * Interface for validator
 * Validates domain objects and operations
 */
export interface IValidator {
  validateModel(model: unknown): model is Model;
  validateSectionId(sectionId: string, model: Model): boolean;
  validateEvent(event: unknown): event is ApplicationEvent;
}
