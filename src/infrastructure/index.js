/**
 * Infrastructure Layer
 * Central export point for all infrastructure components
 *
 * The infrastructure layer contains:
 * - Loader adapters (wrap Three.js loaders)
 * - Format handlers (implement IFormatHandler)
 * - Format detection
 * - Repositories (data persistence)
 */

// Loaders (adapters, handlers, format detection)
export * from './loaders/index.js';

// Repositories
export { ModelRepository } from './repositories/ModelRepository.js';
export { ConfigRepository } from './repositories/ConfigRepository.js';
