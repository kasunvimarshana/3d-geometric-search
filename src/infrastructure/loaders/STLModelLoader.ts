/**
 * STL Loader
 * 
 * Loads STL format models (ASCII and binary).
 * Common format for 3D printing and manufacturing.
 */

import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { IModelLoader, LoadOptions, LoadResult } from '@domain/interfaces/IModelLoader';
import { Model, ModelFormat, ModelMetadata } from '@domain/models/Model';
import { ModelSectionImpl } from '@domain/models/ModelSection';

export class STLModelLoader implements IModelLoader {
  readonly supportedFormats = [ModelFormat.STL];
  private loader = new STLLoader();

  canLoad(format: ModelFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  async load(options: LoadOptions): Promise<LoadResult> {
    return new Promise((resolve, reject) => {
      try {
        const geometry = this.loader.parse(options.data as ArrayBuffer);

        const metadata: ModelMetadata = {
          filename: options.filename,
          format: ModelFormat.STL,
          fileSize: options.data instanceof ArrayBuffer ? options.data.byteLength : 0,
          loadedAt: new Date(),
          vertexCount: geometry.attributes['position']?.count || 0,
          triangleCount: (geometry.attributes['position']?.count || 0) / 3,
        };

        const model = new Model(metadata);

        // STL files contain a single mesh
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;

        const sectionId = 'stl_mesh';
        const section = new ModelSectionImpl(
          sectionId,
          options.filename.replace('.stl', ''),
          null,
          [],
          box ? {
            min: { x: box.min.x, y: box.min.y, z: box.min.z },
            max: { x: box.max.x, y: box.max.y, z: box.max.z },
          } : null
        );

        model.addSection(section);

        // Create Three.js mesh for rendering
        const material = new THREE.MeshStandardMaterial({
          color: 0x3498db,
          metalness: 0.3,
          roughness: 0.7,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.sectionId = sectionId;

        resolve({ model, threeJsObject: mesh });
      } catch (error) {
        reject(new Error(`Failed to load STL: ${error}`));
      }
    });
  }
}
