import { IModelLoader } from "@core/interfaces/repositories";
import { ModelData, UUID } from "@shared/types/interfaces";
import { ModelFormat } from "@shared/types/enums";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { generateId } from "@shared/utils/helpers";
import * as THREE from "three";

/**
 * Loader for OBJ/MTL formats
 * Follows Single Responsibility Principle
 */
export class OBJModelLoader implements IModelLoader {
  private objLoader: OBJLoader;
  private _mtlLoader: MTLLoader;

  constructor() {
    this.objLoader = new OBJLoader();
    this._mtlLoader = new MTLLoader();
  }

  /**
   * Check if this loader can handle the format
   */
  canLoad(format: string): boolean {
    return format === "obj";
  }

  /**
   * Load an OBJ file
   */
  async load(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ModelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const text = event.target?.result as string;

        try {
          const group = this.objLoader.parse(text);
          const modelData = this.convertToModelData(group);
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

      reader.readAsText(file);
    });
  }

  /**
   * Convert OBJ group to ModelData
   */
  private convertToModelData(group: THREE.Group): ModelData {
    const sections = new Map();
    const geometries = new Map();
    const materials = new Map();
    const rootSectionIds: UUID[] = [];

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const boundingBox = {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
      center: { x: center.x, y: center.y, z: center.z },
      size: { x: size.x, y: size.y, z: size.z },
    };

    // Process each mesh in the group
    group.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const sectionId = generateId();
        const geomId = generateId();

        // Add geometry
        geometries.set(geomId, {
          id: geomId,
          type: "mesh",
          vertexCount: child.geometry.attributes.position?.count || 0,
          faceCount: child.geometry.index
            ? child.geometry.index.count / 3
            : child.geometry.attributes.position.count / 3,
          boundingBox,
        });

        // Add material if present
        if (child.material) {
          const matId = generateId();
          const material = Array.isArray(child.material)
            ? child.material[0]
            : child.material;

          if (material instanceof THREE.MeshPhongMaterial) {
            materials.set(matId, {
              id: matId,
              name: material.name,
              color: {
                r: material.color.r,
                g: material.color.g,
                b: material.color.b,
                a: material.opacity,
              },
              opacity: material.opacity,
            });
          }
        }

        // Add section
        sections.set(sectionId, {
          id: sectionId,
          name: child.name || `Mesh_${sectionId.substring(0, 8)}`,
          children: [],
          geometryIds: [geomId],
          visible: true,
          selectable: true,
          properties: {},
        });

        rootSectionIds.push(sectionId);
      }
    });

    return {
      metadata: {
        id: generateId(),
        name: "",
        format: ModelFormat.OBJ,
        fileSize: 0,
        createdAt: new Date(),
      },
      sections,
      geometries,
      materials,
      rootSectionIds,
      boundingBox,
    };
  }
}
