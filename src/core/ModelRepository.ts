import { IModelRepository } from "@domain/interfaces";
import { Model } from "@domain/types";

/**
 * Model Repository
 * Implements Repository pattern for model storage
 * Provides abstraction over data storage
 */
export class ModelRepository implements IModelRepository {
  private models: Map<string, Model>;
  private currentModelId?: string;

  constructor() {
    this.models = new Map();
  }

  /**
   * Save model to repository
   */
  save(model: Model): void {
    if (!this.validateModel(model)) {
      throw new Error("Invalid model object");
    }

    this.models.set(model.id, model);
    this.currentModelId = model.id;
  }

  /**
   * Find model by ID
   */
  findById(id: string): Model | undefined {
    return this.models.get(id);
  }

  /**
   * Get current active model
   */
  getCurrent(): Model | undefined {
    if (!this.currentModelId) {
      return undefined;
    }
    return this.models.get(this.currentModelId);
  }

  /**
   * Clear all models
   */
  clear(): void {
    this.models.clear();
    this.currentModelId = undefined;
  }

  /**
   * Get all model IDs
   */
  getAllIds(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Delete model by ID
   */
  delete(id: string): boolean {
    const deleted = this.models.delete(id);

    if (deleted && this.currentModelId === id) {
      this.currentModelId = undefined;
    }

    return deleted;
  }

  /**
   * Get model count
   */
  count(): number {
    return this.models.size;
  }

  private validateModel(model: Model): boolean {
    if (!model || typeof model !== "object") return false;
    if (!model.id || typeof model.id !== "string") return false;
    if (!model.name || typeof model.name !== "string") return false;
    if (!model.sections || !(model.sections instanceof Map)) return false;
    if (!model.geometries || !(model.geometries instanceof Map)) return false;
    if (!model.materials || !(model.materials instanceof Map)) return false;
    if (!Array.isArray(model.rootSectionIds)) return false;

    return true;
  }
}
