/**
 * Model Loader Factory
 * Implements Factory Pattern for loader instantiation
 */

import type { IModelLoader } from "./IModelLoader";
import { GLTFModelLoader } from "./GLTFModelLoader";
import { OBJModelLoader } from "./OBJModelLoader";
import { STLModelLoader } from "./STLModelLoader";
import type { FileFormat } from "../domain/types";

export class ModelLoaderFactory {
  private static loaders: IModelLoader[] = [
    new GLTFModelLoader(),
    new OBJModelLoader(),
    new STLModelLoader(),
  ];

  /**
   * Get appropriate loader for the given file
   */
  static getLoader(filePath: string): IModelLoader | null {
    for (const loader of this.loaders) {
      if (loader.canLoad(filePath)) {
        return loader;
      }
    }
    return null;
  }

  /**
   * Get all supported file formats
   */
  static getSupportedFormats(): FileFormat[] {
    const formats = new Set<FileFormat>();
    this.loaders.forEach((loader) => {
      loader.supportedFormats.forEach((format) => formats.add(format));
    });
    return Array.from(formats);
  }

  /**
   * Check if a file format is supported
   */
  static isFormatSupported(filePath: string): boolean {
    return this.getLoader(filePath) !== null;
  }

  /**
   * Register a custom loader
   */
  static registerLoader(loader: IModelLoader): void {
    this.loaders.push(loader);
  }
}
