/**
 * Infrastructure Layer - Loaders
 * Central export point for all loader components
 */

// Adapters (wrap Three.js loaders)
export { GLTFLoaderAdapter } from './adapters/GLTFLoaderAdapter.js';
export { OBJLoaderAdapter } from './adapters/OBJLoaderAdapter.js';
export { STLLoaderAdapter } from './adapters/STLLoaderAdapter.js';

// Handlers (implement IFormatHandler)
export { GLTFHandler } from './handlers/GLTFHandler.js';
export { OBJHandler } from './handlers/OBJHandler.js';
export { STLHandler } from './handlers/STLHandler.js';
export { STEPHandler } from './handlers/STEPHandler.js';

// Format Detection
export { FormatDetector } from './FormatDetector.js';
