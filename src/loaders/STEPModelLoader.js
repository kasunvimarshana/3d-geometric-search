import { Model } from '../core/entities/Model.js';

/**
 * STEPModelLoader
 *
 * Loads STEP format models (ISO 10303 - AP203, AP214, AP242).
 *
 * Note: STEP format parsing requires specialized libraries.
 * This is a placeholder implementation that would need integration
 * with a STEP parser library like OpenCascade.js or similar.
 */
export class STEPModelLoader {
  constructor() {
    console.warn(
      'STEPModelLoader: STEP format support requires additional libraries. ' +
        'Consider integrating OpenCascade.js or a similar STEP parser.'
    );
  }

  /**
   * Load model from file
   */
  async load(file) {
    return new Promise((resolve, reject) => {
      reject(
        new Error(
          'STEP format loading not yet implemented. ' +
            'Requires integration with STEP parser library (e.g., OpenCascade.js)'
        )
      );
    });
  }

  /**
   * Check if file is supported
   */
  static supports(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    return ext === 'step' || ext === 'stp';
  }
}

/**
 * Future implementation notes:
 *
 * To implement STEP loading:
 * 1. Install OpenCascade.js: npm install opencascade.js
 * 2. Initialize the OpenCascade WASM module
 * 3. Use the STEP reader to parse the file
 * 4. Convert OpenCascade shapes to Three.js geometry
 * 5. Extract assembly hierarchy and metadata
 * 6. Create Model entity with proper section structure
 *
 * Example integration:
 *
 * import opencascade from 'opencascade.js';
 *
 * async load(file) {
 *   const oc = await opencascade();
 *   const reader = new oc.STEPControl_Reader();
 *   // ... implementation
 * }
 */
