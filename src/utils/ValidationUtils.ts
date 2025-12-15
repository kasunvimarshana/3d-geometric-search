/**
 * Validation utilities
 */

import { Model, ModelSection } from "@domain/types";
import { ApplicationEvent } from "@domain/events";

export class ValidationUtils {
  /**
   * Validate model object
   */
  static isValidModel(obj: unknown): obj is Model {
    if (!obj || typeof obj !== "object") return false;

    const model = obj as Partial<Model>;

    return !!(
      model.id &&
      model.name &&
      model.format &&
      model.sections instanceof Map &&
      model.geometries instanceof Map &&
      model.materials instanceof Map &&
      Array.isArray(model.rootSectionIds) &&
      model.boundingBox
    );
  }

  /**
   * Validate section object
   */
  static isValidSection(obj: unknown): obj is ModelSection {
    if (!obj || typeof obj !== "object") return false;

    const section = obj as Partial<ModelSection>;

    return !!(
      section.id &&
      section.name &&
      Array.isArray(section.childIds) &&
      section.transform &&
      section.boundingBox
    );
  }

  /**
   * Validate event object
   */
  static isValidEvent(obj: unknown): obj is ApplicationEvent {
    if (!obj || typeof obj !== "object") return false;

    const event = obj as Partial<ApplicationEvent>;

    return !!(event.type && typeof event.timestamp === "number");
  }

  /**
   * Validate section ID exists in model
   */
  static validateSectionId(sectionId: string, model: Model): boolean {
    return model.sections.has(sectionId);
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  /**
   * Validate file size
   */
  static isValidFileSize(size: number, maxSizeMB = 100): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size > 0 && size <= maxSizeBytes;
  }
}
