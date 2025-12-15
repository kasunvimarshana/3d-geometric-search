import { IFileHandler } from "@domain/interfaces";
import { ModelFormat } from "@domain/types";

/**
 * File Handler
 * Handles file operations and format detection
 */
export class FileHandler implements IFileHandler {
  private readonly formatExtensions: Map<ModelFormat, string[]> = new Map([
    [ModelFormat.GLTF, [".gltf"]],
    [ModelFormat.GLB, [".glb"]],
    [ModelFormat.STEP, [".step", ".stp"]],
    [ModelFormat.OBJ, [".obj"]],
    [ModelFormat.STL, [".stl"]],
  ]);

  /**
   * Detect format from filename
   */
  detectFormat(filename: string): ModelFormat | undefined {
    const lowercaseName = filename.toLowerCase();

    for (const [format, extensions] of this.formatExtensions.entries()) {
      if (extensions.some((ext) => lowercaseName.endsWith(ext))) {
        return format;
      }
    }

    return undefined;
  }

  /**
   * Read file content
   */
  async readFile(file: File): Promise<ArrayBuffer | string> {
    const format = this.detectFormat(file.name);

    // Text formats
    if (format === ModelFormat.OBJ || format === ModelFormat.GLTF) {
      return this.readAsText(file);
    }

    // Binary formats
    return this.readAsArrayBuffer(file);
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(format: ModelFormat): boolean {
    return this.formatExtensions.has(format);
  }

  private readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event): void => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file as text"));
        }
      };

      reader.onerror = (): void => {
        reject(new Error(`File reading error: ${reader.error?.message}`));
      };

      reader.readAsText(file);
    });
  }

  private readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event): void => {
        if (event.target?.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };

      reader.onerror = (): void => {
        reject(new Error(`File reading error: ${reader.error?.message}`));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
