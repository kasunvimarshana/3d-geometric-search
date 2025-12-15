/**
 * Loader factory
 * Selects appropriate loader based on file format
 */
import { GLTFLoaderAdapter } from './GLTFLoader.js';
import { OBJLoaderAdapter } from './OBJLoader.js';
import { STLLoaderAdapter } from './STLLoader.js';
import { STEPLoaderAdapter } from './STEPLoader.js';

export class LoaderFactory {
  constructor() {
    this.loaders = [
      new GLTFLoaderAdapter(),
      new OBJLoaderAdapter(),
      new STLLoaderAdapter(),
      new STEPLoaderAdapter(),
    ];
  }

  /**
   * Get appropriate loader for a file
   */
  getLoader(file) {
    if (!file || !file.name) {
      throw new Error('Invalid file');
    }

    const loader = this.loaders.find((l) => l.canLoad(file.name));

    if (!loader) {
      const ext = file.name.split('.').pop();
      throw new Error(`No loader found for format: ${ext}`);
    }

    return loader;
  }

  /**
   * Load file with appropriate loader
   */
  async load(file, additionalFiles = {}) {
    const loader = this.getLoader(file);

    // Pass additional files (e.g., MTL for OBJ)
    if (loader instanceof OBJLoaderAdapter && additionalFiles.mtl) {
      return loader.load(file, additionalFiles.mtl);
    }

    return loader.load(file);
  }

  /**
   * Get supported formats
   */
  getSupportedFormats() {
    const formats = new Set();
    this.loaders.forEach((loader) => {
      loader.supportedExtensions.forEach((ext) => formats.add(ext));
    });
    return Array.from(formats);
  }

  /**
   * Check if format is supported
   */
  isSupported(filename) {
    return this.loaders.some((loader) => loader.canLoad(filename));
  }
}

// Export singleton instance
export const loaderFactory = new LoaderFactory();
