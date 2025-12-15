import { IModelLoader } from "@core/interfaces/repositories";
import { ModelData, UUID, BoundingBox } from "@shared/types/interfaces";
import { ModelFormat } from "@shared/types/enums";
import { GLTFLoader, GLTF } from "three/addons/loaders/GLTFLoader.js";
import { generateId } from "@shared/utils/helpers";
import * as THREE from "three";

/**
 * Loader for glTF and GLB formats
 * Follows Single Responsibility Principle
 */
export class GLTFModelLoader implements IModelLoader {
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Check if this loader can handle the format
   */
  canLoad(format: string): boolean {
    return format === "gltf" || format === "glb";
  }

  /**
   * Load a glTF/GLB file
   */
  async load(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ModelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        this.loader.parse(
          arrayBuffer,
          "",
          (gltf: GLTF) => {
            try {
              const modelData = this.convertToModelData(gltf);
              resolve(modelData);
            } catch (error) {
              reject(error);
            }
          },
          (error: ErrorEvent) => {
            reject(error);
          }
        );
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
   * Convert GLTF data to ModelData
   */
  private convertToModelData(gltf: GLTF): ModelData {
    const sections = new Map();
    const geometries = new Map();
    const materials = new Map();
    const rootSectionIds: UUID[] = [];

    // Process the scene
    const scene = gltf.scene;
    const boundingBox = this.calculateBoundingBox(scene);

    // Traverse the scene and build sections
    const processNode = (
      node: THREE.Object3D,
      parentId?: UUID
    ): UUID | null => {
      const sectionId = generateId();
      const childIds: UUID[] = [];

      // Process children
      node.children.forEach((child) => {
        const childId = processNode(child, sectionId);
        if (childId) childIds.push(childId);
      });

      // Process geometry
      const geometryIds: UUID[] = [];
      if (node instanceof THREE.Mesh) {
        const geomId = generateId();
        geometries.set(geomId, {
          id: geomId,
          type: "mesh",
          vertexCount: node.geometry.attributes.position?.count || 0,
          faceCount: node.geometry.index
            ? node.geometry.index.count / 3
            : undefined,
          boundingBox: this.getNodeBoundingBox(node),
        });
        geometryIds.push(geomId);

        // Process material
        if (node.material) {
          const matId = generateId();
          const material = Array.isArray(node.material)
            ? node.material[0]
            : node.material;

          if (material instanceof THREE.MeshStandardMaterial) {
            materials.set(matId, {
              id: matId,
              name: material.name,
              color: {
                r: material.color.r,
                g: material.color.g,
                b: material.color.b,
                a: material.opacity,
              },
              metalness: material.metalness,
              roughness: material.roughness,
              opacity: material.opacity,
            });
          }
        }
      }

      // Create section
      sections.set(sectionId, {
        id: sectionId,
        name: node.name || `Section_${sectionId.substring(0, 8)}`,
        parentId,
        children: childIds,
        geometryIds,
        visible: node.visible,
        selectable: true,
        properties: {},
      });

      if (!parentId) {
        rootSectionIds.push(sectionId);
      }

      return sectionId;
    };

    // Process all root nodes
    scene.children.forEach((child: THREE.Object3D) => {
      processNode(child);
    });

    return {
      metadata: {
        id: generateId(),
        name: "",
        format: ModelFormat.GLTF,
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

  /**
   * Calculate bounding box for scene
   */
  private calculateBoundingBox(scene: THREE.Object3D): BoundingBox {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    return {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
      center: { x: center.x, y: center.y, z: center.z },
      size: { x: size.x, y: size.y, z: size.z },
    };
  }

  /**
   * Get bounding box for a single node
   */
  private getNodeBoundingBox(node: THREE.Object3D): BoundingBox {
    const box = new THREE.Box3().setFromObject(node);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    return {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
      center: { x: center.x, y: center.y, z: center.z },
      size: { x: size.x, y: size.y, z: size.z },
    };
  }
}
