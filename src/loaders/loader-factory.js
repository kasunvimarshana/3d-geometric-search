/**
 * Loader Factory
 *
 * Factory pattern implementation for creating appropriate loaders based on file format.
 * Follows the Open/Closed Principle - open for extension, closed for modification.
 */

import { GltfLoader } from "./gltf-loader.js";
import { ObjLoader } from "./obj-loader.js";
import { StlLoader } from "./stl-loader.js";
import { StepLoader } from "./step-loader.js";

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
   * Gets the appropriate loader for a file
   * @param {String} filename - Name of the file
   * @returns {BaseLoader|null}
   */
  getLoader(filename) {
    const extension = this.getExtension(filename);

    for (const loader of this.loaders) {
      if (loader.canHandle(extension)) {
        return loader;
      }
    }

    return null;
  }

  /**
   * Checks if a file format is supported
   * @param {String} filename
   * @returns {Boolean}
   */
  isSupported(filename) {
    return this.getLoader(filename) !== null;
  }

  /**
   * Gets file extension from filename
   * @param {String} filename
   * @returns {String}
   */
  getExtension(filename) {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0].toLowerCase() : "";
  }

  /**
   * Registers a new loader
   * @param {BaseLoader} loader
   */
  registerLoader(loader) {
    this.loaders.push(loader);
  }

  /**
   * Gets list of supported extensions
   * @returns {Array<String>}
   */
  getSupportedExtensions() {
    return [".gltf", ".glb", ".obj", ".stl", ".step", ".stp"];
  }
}
