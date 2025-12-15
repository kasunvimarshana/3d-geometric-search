/**
 * Model Loader Factory
 * Central registry for all format loaders
 */

import { GltfLoader } from "./GltfLoader.js";
import { ObjLoader } from "./ObjLoader.js";
import { StlLoader } from "./StlLoader.js";
import { StepLoader } from "./StepLoader.js";
import { getFormatFromFilename } from "../core/types.js";

export class LoaderFactory {
  constructor() {
    this.loaders = [
      new GltfLoader(),
      new ObjLoader(),
      new StlLoader(),
      new StepLoader(),
    ];
  }

  /**
   * Gets appropriate loader for a file
   * @param {File} file - File to load
   * @returns {BaseLoader|null}
   */
  getLoader(file) {
    const format = getFormatFromFilename(file.name);

    if (!format) {
      return null;
    }

    return this.loaders.find((loader) => loader.supports(format));
  }

  /**
   * Loads a 3D model file
   * @param {File} file - File to load
   * @returns {Promise<Model3D>}
   */
  async loadModel(file) {
    const loader = this.getLoader(file);

    if (!loader) {
      throw new Error(`Unsupported file format: ${file.name}`);
    }

    try {
      const model = await loader.load(file);
      return model;
    } catch (error) {
      throw new Error(`Failed to load model: ${error.message}`);
    }
  }

  /**
   * Checks if a file format is supported
   * @param {string} filename - File name
   * @returns {boolean}
   */
  isSupported(filename) {
    const format = getFormatFromFilename(filename);
    return (
      format !== null && this.loaders.some((loader) => loader.supports(format))
    );
  }

  /**
   * Gets list of supported file extensions
   * @returns {string[]}
   */
  getSupportedExtensions() {
    const extensions = new Set();
    this.loaders.forEach((loader) => {
      loader.supportedFormats.forEach((format) => extensions.add(format));
    });
    return Array.from(extensions);
  }
}

// Create singleton instance
export const loaderFactory = new LoaderFactory();
