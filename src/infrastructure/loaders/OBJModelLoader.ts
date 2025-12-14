/**
 * OBJ Loader
 * 
 * Loads OBJ format models (with optional MTL materials).
 * Common format for geometry exchange.
 */

import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';
import { IModelLoader, LoadOptions, LoadResult } from '@domain/interfaces/IModelLoader';
import { Model, ModelFormat, ModelMetadata } from '@domain/models/Model';
import { ModelSectionImpl } from '@domain/models/ModelSection';

export class OBJModelLoader implements IModelLoader {
  readonly supportedFormats = [ModelFormat.OBJ];
  private loader = new OBJLoader();

  canLoad(format: ModelFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  async load(options: LoadOptions): Promise<LoadResult> {
    return new Promise((resolve, reject) => {
      try {
        // Convert ArrayBuffer to text
        const decoder = new TextDecoder('utf-8');
        const text = typeof options.data === 'string' 
          ? options.data 
          : decoder.decode(options.data as ArrayBuffer);

        const group = this.loader.parse(text);

        const metadata: ModelMetadata = {
          filename: options.filename,
          format: ModelFormat.OBJ,
          fileSize: options.data instanceof ArrayBuffer ? options.data.byteLength : 0,
          loadedAt: new Date(),
          vertexCount: this.countVertices(group),
          triangleCount: this.countTriangles(group),
        };

        const model = new Model(metadata);
        this.processGroup(group, model);

        resolve({ model, threeJsObject: group });
      } catch (error) {
        reject(new Error(`Failed to load OBJ: ${error}`));
      }
    });
  }

  private processGroup(
    group: THREE.Group,
    model: Model,
    parentId: string | null = null,
    parentSection: ModelSectionImpl | null = null
  ): void {
    group.children.forEach((child, index) => {
      const sectionId = `${parentId || 'root'}_${index}_${child.uuid}`;
      const childIds: string[] = [];

      const section = new ModelSectionImpl(
        sectionId,
        child.name || `Object_${index}`,
        parentId,
        childIds
      );

      // Store reference to Three.js object
      (child as any).userData.sectionId = sectionId;

      // Calculate bounding box if mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox;
        
        if (box) {
          section.boundingBox = {
            min: { x: box.min.x, y: box.min.y, z: box.min.z },
            max: { x: box.max.x, y: box.max.y, z: box.max.z },
          };
        }
      }

      model.addSection(section);

      // Update parent's children array
      if (parentSection) {
        parentSection.children.push(sectionId);
      }

      // Process children recursively
      if (child.children && child.children.length > 0) {
        this.processGroup(child as THREE.Group, model, section.id, section);
      }
    });
  }

  private countVertices(object: THREE.Object3D): number {
    let count = 0;
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        count += child.geometry.attributes['position']?.count || 0;
      }
    });
    return count;
  }

  private countTriangles(object: THREE.Object3D): number {
    let count = 0;
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const position = child.geometry.attributes['position'];
        if (position) {
          count += position.count / 3;
        }
      }
    });
    return count;
  }
}
