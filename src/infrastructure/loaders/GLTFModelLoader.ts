/**
 * glTF Loader
 * 
 * Loads glTF and GLB format models.
 * Preferred format for web-based 3D rendering.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { IModelLoader, LoadOptions, LoadResult } from '@domain/interfaces/IModelLoader';
import { Model, ModelFormat, ModelMetadata } from '@domain/models/Model';
import { ModelSectionImpl } from '@domain/models/ModelSection';

export class GLTFModelLoader implements IModelLoader {
  readonly supportedFormats = [ModelFormat.GLTF, ModelFormat.GLB];
  private loader = new GLTFLoader();

  canLoad(format: ModelFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  async load(options: LoadOptions): Promise<LoadResult> {
    return new Promise((resolve, reject) => {
      try {
        // Convert ArrayBuffer to Blob URL
        const blob = new Blob([options.data], { 
          type: options.format === ModelFormat.GLB 
            ? 'model/gltf-binary' 
            : 'model/gltf+json' 
        });
        const url = URL.createObjectURL(blob);

        this.loader.load(
          url,
          (gltf) => {
            URL.revokeObjectURL(url);

            const metadata: ModelMetadata = {
              filename: options.filename,
              format: options.format || ModelFormat.GLB,
              fileSize: options.data instanceof ArrayBuffer ? options.data.byteLength : 0,
              loadedAt: new Date(),
              vertexCount: this.countVertices(gltf.scene),
              triangleCount: this.countTriangles(gltf.scene),
            };

            const model = new Model(metadata);
            this.processScene(gltf.scene, model);

            resolve({ model, threeJsObject: gltf.scene });
          },
          undefined,
          (error) => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load glTF: ${error}`));
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  private processScene(
    scene: THREE.Group,
    model: Model,
    parentId: string | null = null,
    parentSection: ModelSectionImpl | null = null
  ): void {
    scene.children.forEach((child, index) => {
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
        this.processScene(child as THREE.Group, model, section.id, section);
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
