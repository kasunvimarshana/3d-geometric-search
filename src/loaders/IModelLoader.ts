/**
 * Base interface for 3D file format loaders
 * Following Single Responsibility Principle - each loader handles one format
 */

import type { Model3D, FileFormat } from "../domain/types";

export interface IModelLoader {
  readonly supportedFormats: FileFormat[];
  canLoad(filePath: string): boolean;
  load(filePath: string, fileData: ArrayBuffer | string): Promise<Model3D>;
}

export abstract class BaseModelLoader implements IModelLoader {
  abstract readonly supportedFormats: FileFormat[];

  canLoad(filePath: string): boolean {
    const extension = this.getFileExtension(filePath).toLowerCase();
    return this.supportedFormats.some((format) => format === extension);
  }

  abstract load(
    filePath: string,
    fileData: ArrayBuffer | string
  ): Promise<Model3D>;

  protected getFileExtension(filePath: string): string {
    const match = filePath.match(/\.([^.]+)$/);
    return match ? match[1] : "";
  }

  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
