/**
 * Composite Model Loader
 * 
 * Aggregates multiple format-specific loaders.
 * Routes loading requests to the appropriate loader.
 */

import { IModelLoader, LoadOptions, LoadResult } from '@domain/interfaces/IModelLoader';
import { ModelFormat } from '@domain/models/Model';

export class CompositeModelLoader implements IModelLoader {
  private loaders: Map<ModelFormat, IModelLoader> = new Map();

  get supportedFormats(): ModelFormat[] {
    return Array.from(this.loaders.keys());
  }

  registerLoader(loader: IModelLoader): void {
    loader.supportedFormats.forEach((format) => {
      this.loaders.set(format, loader);
    });
  }

  canLoad(format: ModelFormat): boolean {
    return this.loaders.has(format);
  }

  async load(options: LoadOptions): Promise<LoadResult> {
    const format = options.format || ModelFormat.UNKNOWN;
    const loader = this.loaders.get(format);

    if (!loader) {
      throw new Error(`No loader available for format: ${format}`);
    }

    return loader.load(options);
  }
}
