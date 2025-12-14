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
  EventType,
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
    try {
      // Publish loading event
      this.eventBus.publish(new ModelLoadingEvent({ filename: file.name }));

      // Determine format
      const format = this.detectFormat(file.name);
      
      // Read file
      const data = await this.readFile(file);

      // Load model
      const result = await this.loader.load({
        filename: file.name,
        data,
        format,
      });

      // Store and render
      this.currentModel = result.model;
      await this.renderer.loadModel(result.model);

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
        result.warnings.forEach((warning) => console.warn(warning));
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish(new ModelLoadErrorEvent({ error: errorObj }));
      throw error;
    }
  }

  selectSection(sectionId: string): void {
    if (!this.currentModel) return;

    const section = this.currentModel.getSection(sectionId);
    if (!section) return;

    // Clear previous selection
    this.currentModel.clearSelection();
    
    // Set new selection
    section.isSelected = true;
    this.selectedSectionId = sectionId;

    // Highlight in renderer
    this.renderer.highlightSection(section);

    // Publish event
    this.eventBus.publish(new SectionSelectedEvent({ sectionId }));
  }

  focusOnSection(sectionId: string): void {
    if (!this.currentModel) return;

    const section = this.currentModel.getSection(sectionId);
    if (!section) return;

    // Focus in renderer
    this.renderer.focusOnSection(section);

    // Publish event
    this.eventBus.publish(new SectionFocusedEvent({ sectionId }));
  }

  getCurrentModel(): Model | null {
    return this.currentModel;
  }

  getSelectedSection(): ModelSection | undefined {
    if (!this.currentModel || !this.selectedSectionId) return undefined;
    return this.currentModel.getSection(this.selectedSectionId);
  }

  clearModel(): void {
    this.currentModel = null;
    this.selectedSectionId = null;
    this.renderer.clearScene();
  }

  private detectFormat(filename: string): ModelFormat {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    const formatMap: Record<string, ModelFormat> = {
      'gltf': ModelFormat.GLTF,
      'glb': ModelFormat.GLB,
      'step': ModelFormat.STEP,
      'stp': ModelFormat.STEP,
      'obj': ModelFormat.OBJ,
      'stl': ModelFormat.STL,
    };

    return formatMap[ext] || ModelFormat.UNKNOWN;
  }

  private async readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
