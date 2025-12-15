import { IModelLoader } from "@domain/interfaces";
import { Model, ModelFormat } from "@domain/types";
import { GLTFModelLoader } from "./GLTFModelLoader";
import { OBJModelLoader } from "./OBJModelLoader";
import { STLModelLoader } from "./STLModelLoader";

/**
 * Model Loader Factory
 * Implements Factory pattern to select appropriate loader based on format
 * Follows Open/Closed Principle - easy to extend with new loaders
 */
export class ModelLoaderFactory {
  private loaders: Map<ModelFormat, IModelLoader>;

  constructor() {
    this.loaders = new Map();
    this.registerDefaultLoaders();
  }

  private registerDefaultLoaders(): void {
    // Register glTF/GLB loader
    const gltfLoader = new GLTFModelLoader();
    gltfLoader.supportedFormats.forEach((format) => {
      this.loaders.set(format, gltfLoader);
    });

    // Register OBJ loader
    const objLoader = new OBJModelLoader();
    objLoader.supportedFormats.forEach((format) => {
      this.loaders.set(format, objLoader);
    });

    // Register STL loader
    const stlLoader = new STLModelLoader();
    stlLoader.supportedFormats.forEach((format) => {
      this.loaders.set(format, stlLoader);
    });
  }

  /**
   * Register a custom loader
   */
  registerLoader(loader: IModelLoader): void {
    loader.supportedFormats.forEach((format: ModelFormat) => {
      this.loaders.set(format, loader);
    });
  }

  /**
   * Get loader for specific format
   */
  getLoader(format: ModelFormat): IModelLoader | undefined {
    return this.loaders.get(format);
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(format: ModelFormat): boolean {
    return this.loaders.has(format);
  }

  /**
   * Get all supported formats
   */
  getSupportedFormats(): ModelFormat[] {
    return Array.from(this.loaders.keys());
  }

  /**
   * Load model using appropriate loader
   */
  async loadModel(
    data: ArrayBuffer | string,
    format: ModelFormat,
    filename: string
  ): Promise<Model> {
    const loader = this.getLoader(format);

    if (!loader) {
      throw new Error(`Unsupported format: ${format}`);
    }

    if (!loader.canLoad(format)) {
      throw new Error(`Loader cannot handle format: ${format}`);
    }

    try {
      return await loader.load(data, filename);
    } catch (error) {
      throw new Error(`Failed to load model: ${error}`);
    }
  }
}
