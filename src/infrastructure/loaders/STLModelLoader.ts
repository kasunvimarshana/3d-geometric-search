import { IModelLoader } from "@domain/interfaces";
import {
  Model,
  ModelFormat,
  ModelSection,
  Geometry,
  Material,
  BoundingBox,
} from "@domain/types";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

/**
 * STL Model Loader
 * Implements IModelLoader for STL format (ASCII and Binary)
 */
export class STLModelLoader implements IModelLoader {
  readonly supportedFormats = [ModelFormat.STL];
  private loader: STLLoader;

  constructor() {
    this.loader = new STLLoader();
  }

  canLoad(format: ModelFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  async load(data: ArrayBuffer | string, filename: string): Promise<Model> {
    return new Promise((resolve, reject) => {
      try {
        let geometry: THREE.BufferGeometry;

        if (typeof data === "string") {
          geometry = this.loader.parse(data);
        } else {
          geometry = this.loader.parse(data);
        }

        const model = this.parseSTL(geometry, filename);
        resolve(model);
      } catch (error) {
        reject(new Error(`Failed to parse STL model: ${error}`));
      }
    });
  }

  private parseSTL(geometry: THREE.BufferGeometry, filename: string): Model {
    const sections = new Map<string, ModelSection>();
    const geometries = new Map<string, Geometry>();
    const materials = new Map<string, Material>();

    // STL files contain a single mesh, so we create one section
    const sectionId = "section_0";
    const geometryId = "geometry_0";
    const materialId = "material_0";

    // Extract geometry
    geometries.set(geometryId, this.extractGeometry(geometry, geometryId));

    // Create default material
    materials.set(materialId, {
      id: materialId,
      name: "Default Material",
      color: "#cccccc",
      metalness: 0.1,
      roughness: 0.8,
      opacity: 1.0,
      transparent: false,
    });

    // Calculate bounding box
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const boundingBox: BoundingBox = {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
    };

    // Create section
    const section: ModelSection = {
      id: sectionId,
      name: filename,
      parentId: undefined,
      childIds: [],
      geometryId,
      materialId,
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
      boundingBox,
      metadata: {},
      visible: true,
      selected: false,
      highlighted: false,
    };

    sections.set(sectionId, section);

    return {
      id: `model_${Date.now()}`,
      name: filename,
      format: ModelFormat.STL,
      sections,
      geometries,
      materials,
      rootSectionIds: [sectionId],
      boundingBox,
      metadata: {},
    };
  }

  private extractGeometry(
    geometry: THREE.BufferGeometry,
    id: string
  ): Geometry {
    const positionAttr = geometry.getAttribute("position");
    const normalAttr = geometry.getAttribute("normal");
    const index = geometry.getIndex();

    return {
      id,
      type: "BufferGeometry",
      vertices: Array.from(positionAttr.array),
      indices: index ? Array.from(index.array) : undefined,
      normals: normalAttr ? Array.from(normalAttr.array) : undefined,
    };
  }
}
