/**
 * Model Loader Interface
 *
 * Contract for loading 3D models from various formats.
 * Implementations handle format-specific parsing and conversion.
 */

import { Model, ModelFormat } from '../models/Model';

export interface LoadOptions {
  readonly filename: string;
  readonly data: ArrayBuffer | string;
  readonly format?: ModelFormat;
}

export interface LoadResult {
  readonly model: Model;
  readonly threeJsObject?: unknown;
  readonly warnings?: string[];
}

export interface IModelLoader {
  readonly supportedFormats: ModelFormat[];

  canLoad(format: ModelFormat): boolean;
  load(options: LoadOptions): Promise<LoadResult>;
}
