/**
 * Model Service
 *
 * Orchestrates model-related operations.
 * Manages model state and coordinates between loaders and renderers.
 */

import { Model, ModelFormat } from '@domain/models/Model';
import { ModelSection } from '@domain/models/ModelSection';
import { IModelLoader } from '@domain/interfaces/IModelLoader';
import { IEventBus } from '@domain/interfaces/IEventBus';
import { IRenderer } from '@domain/interfaces/IRenderer';
import {
  ModelLoadingEvent,
  ModelLoadedEvent,
  ModelLoadErrorEvent,
  SectionSelectedEvent,
  SectionFocusedEvent,
  SectionDeselectedEvent,
  SelectionClearedEvent,
  ModelClearedEvent,
  SectionClickedEvent,
  ViewportClickedEvent,
  ClickErrorEvent,
} from '@domain/events/DomainEvents';

export class ModelService {
  private currentModel: Model | null = null;
  private selectedSectionId: string | null = null;

  constructor(
    private readonly loader: IModelLoader,
    private readonly renderer: IRenderer,
    private readonly eventBus: IEventBus
  ) {}

  async loadModel(file: File): Promise<void> {
    // Validate input
    if (!file) {
      const error = new Error('No file provided');
      this.eventBus.publish(new ModelLoadErrorEvent({ error }));
      throw error;
    }

    // Validate file size (e.g., 500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      const error = new Error(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: ${maxSize / 1024 / 1024}MB`
      );
      this.eventBus.publish(new ModelLoadErrorEvent({ error }));
      throw error;
    }

    try {
      // Publish loading event
      this.eventBus.publish(new ModelLoadingEvent({ filename: file.name }));

      // Determine format
      const format = this.detectFormat(file.name);

      if (format === ModelFormat.UNKNOWN) {
        throw new Error(
          `Unsupported file format. Supported formats: .gltf, .glb, .obj, .stl, .step, .stp`
        );
      }

      // Check if loader supports format
      if (!this.loader.canLoad(format)) {
        throw new Error(
          `No loader available for format: ${format}. This format may require additional configuration.`
        );
      }

      // Read file
      const data = await this.readFile(file);

      // Load model
      const result = await this.loader.load({
        filename: file.name,
        data,
        format,
      });

      // Validate result
      if (!result || !result.model) {
        throw new Error('Loader returned invalid result');
      }

      // Clear previous model
      if (this.currentModel) {
        this.clearModel();
      }

      // Store and render
      this.currentModel = result.model;
      await this.renderer.loadModel(result.model, result.threeJsObject);

      // Publish loaded event
      this.eventBus.publish(
        new ModelLoadedEvent({
          filename: file.name,
          sectionCount: result.model.getAllSections().length,
          format: result.model.metadata.format,
        })
      );

      // Log warnings if any
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning) => console.warn('[ModelLoader]', warning));
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error('[ModelService] Load error:', errorObj);
      this.eventBus.publish(new ModelLoadErrorEvent({ error: errorObj }));
      throw error;
    }
  }

  selectSection(sectionId: string): void {
    if (!this.currentModel) {
      console.warn('[ModelService] No model loaded, cannot select section');
      return;
    }

    if (!sectionId) {
      console.warn('[ModelService] Invalid section ID');
      return;
    }

    const section = this.currentModel.getSection(sectionId);
    if (!section) {
      console.warn(`[ModelService] Section not found: ${sectionId}`);
      return;
    }

    try {
      // Clear previous selection
      this.currentModel.clearSelection();

      // Set new selection
      section.isSelected = true;
      this.selectedSectionId = sectionId;

      // Highlight in renderer
      this.renderer.highlightSection(section);

      // Publish event
      this.eventBus.publish(new SectionSelectedEvent({ sectionId }));
    } catch (error) {
      console.error('[ModelService] Error selecting section:', error);
    }
  }

  focusOnSection(sectionId: string): void {
    if (!this.currentModel) {
      console.warn('[ModelService] No model loaded, cannot focus on section');
      return;
    }

    if (!sectionId) {
      console.warn('[ModelService] Invalid section ID');
      return;
    }

    const section = this.currentModel.getSection(sectionId);
    if (!section) {
      console.warn(`[ModelService] Section not found: ${sectionId}`);
      return;
    }

    try {
      // Focus in renderer
      this.renderer.focusOnSection(section);

      // Publish event
      this.eventBus.publish(new SectionFocusedEvent({ sectionId }));
    } catch (error) {
      console.error('[ModelService] Error focusing on section:', error);
    }
  }

  getCurrentModel(): Model | null {
    return this.currentModel;
  }

  getSelectedSection(): ModelSection | undefined {
    if (!this.currentModel || !this.selectedSectionId) return undefined;
    return this.currentModel.getSection(this.selectedSectionId);
  }

  clearSelection(): void {
    try {
      if (!this.currentModel) {
        console.warn('[ModelService] No model loaded, cannot clear selection');
        return;
      }

      // Clear selection in model
      this.currentModel.clearSelection();
      this.selectedSectionId = null;

      // Clear highlight in renderer
      this.renderer.clearHighlight();

      // Publish event
      this.eventBus.publish(new SelectionClearedEvent());
    } catch (error) {
      console.error('[ModelService] Error clearing selection:', error);
    }
  }

  deselectSection(sectionId: string): void {
    try {
      if (!this.currentModel) {
        console.warn('[ModelService] No model loaded');
        return;
      }

      if (!sectionId) {
        console.warn('[ModelService] Invalid section ID');
        return;
      }

      const section = this.currentModel.getSection(sectionId);
      if (!section) {
        console.warn(`[ModelService] Section not found: ${sectionId}`);
        return;
      }

      // Deselect section
      section.isSelected = false;
      if (this.selectedSectionId === sectionId) {
        this.selectedSectionId = null;
      }

      // Clear highlight in renderer
      this.renderer.clearHighlight();

      // Publish event
      this.eventBus.publish(new SectionDeselectedEvent({ sectionId }));
    } catch (error) {
      console.error('[ModelService] Error deselecting section:', error);
    }
  }

  clearModel(): void {
    try {
      this.currentModel = null;
      this.selectedSectionId = null;
      this.renderer.clearScene();

      // Publish event
      this.eventBus.publish(new ModelClearedEvent());
    } catch (error) {
      console.error('[ModelService] Error clearing model:', error);
    }
  }

  handleSectionClick(sectionId: string, event: MouseEvent): void {
    try {
      if (!this.currentModel) {
        console.warn('[ModelService] No model loaded, ignoring click');
        return;
      }

      if (!sectionId) {
        console.warn('[ModelService] Invalid section ID in click');
        return;
      }

      // Publish click event
      this.eventBus.publish(
        new SectionClickedEvent({
          sectionId,
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        })
      );

      // Select the clicked section
      this.selectSection(sectionId);
    } catch (error) {
      console.error('[ModelService] Error handling section click:', error);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish(new ClickErrorEvent({ error: errorObj, context: 'section click' }));
    }
  }

  handleViewportClick(event: MouseEvent): void {
    try {
      // Publish viewport click event
      this.eventBus.publish(
        new ViewportClickedEvent({
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        })
      );

      // Clear selection on empty space click (left button only)
      if (event.button === 0) {
        this.clearSelection();
      }
    } catch (error) {
      console.error('[ModelService] Error handling viewport click:', error);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish(new ClickErrorEvent({ error: errorObj, context: 'viewport click' }));
    }
  }

  enableClickHandling(): void {
    try {
      if (typeof this.renderer.enableClickHandling === 'function') {
        this.renderer.enableClickHandling(
          (sectionId: string, event: MouseEvent) => this.handleSectionClick(sectionId, event),
          (event: MouseEvent) => this.handleViewportClick(event)
        );
      }
    } catch (error) {
      console.error('[ModelService] Error enabling click handling:', error);
    }
  }

  disableClickHandling(): void {
    try {
      if (typeof this.renderer.disableClickHandling === 'function') {
        this.renderer.disableClickHandling();
      }
    } catch (error) {
      console.error('[ModelService] Error disabling click handling:', error);
    }
  }

  private detectFormat(filename: string): ModelFormat {
    const ext = filename.toLowerCase().split('.').pop() || '';

    const formatMap: Record<string, ModelFormat> = {
      gltf: ModelFormat.GLTF,
      glb: ModelFormat.GLB,
      step: ModelFormat.STEP,
      stp: ModelFormat.STEP,
      obj: ModelFormat.OBJ,
      stl: ModelFormat.STL,
    };

    return formatMap[ext] || ModelFormat.UNKNOWN;
  }

  private async readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event): void => {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };

      reader.onerror = (): void => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
