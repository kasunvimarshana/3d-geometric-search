import { IModelLoader } from "@core/interfaces/repositories";
import { ModelData } from "@shared/types/interfaces";
import { ModelFormat } from "@shared/types/enums";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { generateId } from "@shared/utils/helpers";
import * as THREE from "three";

/**
 * Loader for STL format
 * Follows Single Responsibility Principle
 */
export class STLModelLoader implements IModelLoader {
  private loader: STLLoader;

  constructor() {
    this.loader = new STLLoader();
  }

  /**
   * Check if this loader can handle the format
   */
  canLoad(format: string): boolean {
    return format === "stl";
  }

  /**
   * Load an STL file
   */
  async load(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ModelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        try {
          const geometry = this.loader.parse(arrayBuffer);
          const modelData = this.convertToModelData(geometry);
          resolve(modelData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));

      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert STL geometry to ModelData
   */
  private convertToModelData(geometry: THREE.BufferGeometry): ModelData {
    const sections = new Map();
    const geometries = new Map();
    const materials = new Map();

    const sectionId = generateId();
    const geomId = generateId();
    const matId = generateId();

    // Calculate bounding box
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const boundingBox = {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
      center: { x: center.x, y: center.y, z: center.z },
      size: { x: size.x, y: size.y, z: size.z },
    };

    // Add geometry
    geometries.set(geomId, {
      id: geomId,
      type: "mesh",
      vertexCount: geometry.attributes.position.count,
      faceCount: geometry.attributes.position.count / 3,
      boundingBox,
    });

    // Add default material
    materials.set(matId, {
      id: matId,
      name: "Default STL Material",
      color: { r: 0.7, g: 0.7, b: 0.7, a: 1.0 },
      metalness: 0.3,
      roughness: 0.7,
      opacity: 1.0,
    });

    // Add section
    sections.set(sectionId, {
      id: sectionId,
      name: "STL Model",
      children: [],
      geometryIds: [geomId],
      visible: true,
      selectable: true,
      properties: {},
    });

    return {
      metadata: {
        id: generateId(),
        name: "",
        format: ModelFormat.STL,
        fileSize: 0,
        createdAt: new Date(),
      },
      sections,
      geometries,
      materials,
      rootSectionIds: [sectionId],
      boundingBox,
    };
  }
}
