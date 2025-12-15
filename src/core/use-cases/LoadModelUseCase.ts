import { Model } from "@core/entities/Model";
import { Section } from "@core/entities/Section";
import { IModelLoader } from "@core/interfaces/repositories";
import { ModelFormat } from "@shared/types/enums";
import { ErrorInfo } from "@shared/types/interfaces";
import { ERROR_CODES, FILE_LIMITS } from "@shared/constants";
import { getFileExtension } from "@shared/utils/helpers";
import { EventBus, ModelLoadedEvent } from "@domain/events/DomainEvents";

/**
 * Use case for loading 3D models
 * Follows Single Responsibility Principle - handles only model loading logic
 */
export class LoadModelUseCase {
  constructor(
    private readonly loaders: Map<ModelFormat, IModelLoader>,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Execute the use case
   */
  async execute(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ model: Model | null; error: ErrorInfo | null }> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (validation.error) {
        return { model: null as any, error: validation.error };
      }

      // Get appropriate loader
      const format = validation.format!;
      const loader = this.loaders.get(format);
      if (!loader) {
        return {
          model: null,
          error: {
            code: ERROR_CODES.UNSUPPORTED_FORMAT,
            message: `No loader found for format: ${format}`,
            timestamp: new Date(),
          },
        };
      }

      // Load model data
      const modelData = await loader.load(file, onProgress);

      // Create model entity
      const model = new Model({
        name: file.name,
        format,
        fileSize: file.size,
        createdAt: new Date(),
      });

      // Populate model from data
      modelData.sections.forEach((sectionData) => {
        const section = new Section(sectionData);
        model.addSection(section);
      });

      modelData.geometries.forEach((geometry, id) => {
        model.addGeometry(id, geometry);
      });

      modelData.materials.forEach((material, id) => {
        model.addMaterial(id, material);
      });

      model.setBoundingBox(modelData.boundingBox);

      // Publish event
      await this.eventBus.publish(new ModelLoadedEvent(model.id));

      return { model };
    } catch (error) {
      return {
        model: null as any,
        error: {
          code: ERROR_CODES.LOADING_FAILED,
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Validate the input file
   */
  private validateFile(file: File): {
    format?: ModelFormat;
    error?: ErrorInfo;
  } {
    // Check file size
    if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
      return {
        error: {
          code: ERROR_CODES.FILE_TOO_LARGE,
          message: `File size exceeds maximum allowed (${FILE_LIMITS.MAX_FILE_SIZE} bytes)`,
          timestamp: new Date(),
        },
      };
    }

    // Determine format from extension
    const extension = getFileExtension(file.name);
    let format: ModelFormat | undefined;

    switch (extension) {
      case ".gltf":
        format = ModelFormat.GLTF;
        break;
      case ".glb":
        format = ModelFormat.GLB;
        break;
      case ".step":
      case ".stp":
        format = ModelFormat.STEP;
        break;
      case ".obj":
        format = ModelFormat.OBJ;
        break;
      case ".stl":
        format = ModelFormat.STL;
        break;
      default:
        return {
          error: {
            code: ERROR_CODES.UNSUPPORTED_FORMAT,
            message: `Unsupported file format: ${extension}`,
            timestamp: new Date(),
          },
        };
    }

    return { format };
  }
}
