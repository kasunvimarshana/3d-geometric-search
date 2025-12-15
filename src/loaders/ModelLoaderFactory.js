import { GLTFModelLoader } from './GLTFModelLoader.js';
import { OBJModelLoader } from './OBJModelLoader.js';
import { STLModelLoader } from './STLModelLoader.js';
import { STEPModelLoader } from './STEPModelLoader.js';

/**
 * ModelLoaderFactory
 *
 * Factory for creating appropriate model loaders based on file format.
 */
export class ModelLoaderFactory {
  static loaders = [GLTFModelLoader, OBJModelLoader, STLModelLoader, STEPModelLoader];

  /**
   * Get loader for file
   */
  static getLoader(file) {
    const fileName = file.name;

    for (const LoaderClass of this.loaders) {
      if (LoaderClass.supports(fileName)) {
        return new LoaderClass();
      }
    }

    throw new Error(`Unsupported file format: ${fileName}`);
  }

  /**
   * Check if file is supported
   */
  static isSupported(fileName) {
    return this.loaders.some((LoaderClass) => LoaderClass.supports(fileName));
  }

  /**
   * Get supported formats
   */
  static getSupportedFormats() {
    return ['gltf', 'glb', 'obj', 'stl', 'step', 'stp'];
  }
}
