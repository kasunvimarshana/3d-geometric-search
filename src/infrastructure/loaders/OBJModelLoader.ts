import { IModelLoader } from "@domain/interfaces";
import {
  Model,
  ModelFormat,
  ModelSection,
  Geometry,
  Material,
  BoundingBox,
  Transform,
} from "@domain/types";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/**
 * OBJ/MTL Model Loader
 * Implements IModelLoader for OBJ format with optional MTL material files
 */
export class OBJModelLoader implements IModelLoader {
  readonly supportedFormats = [ModelFormat.OBJ];
  private objLoader: OBJLoader;

  constructor() {
    this.objLoader = new OBJLoader();
    // MTLLoader initialization removed (not currently used)
  }

  canLoad(format: ModelFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  async load(data: ArrayBuffer | string, filename: string): Promise<Model> {
    const objContent =
      typeof data === "string" ? data : new TextDecoder().decode(data);

    return new Promise((resolve, reject) => {
      try {
        const group = this.objLoader.parse(objContent);
        const model = this.parseOBJ(group, filename);
        resolve(model);
      } catch (error) {
        reject(new Error(`Failed to parse OBJ model: ${error}`));
      }
    });
  }

  private parseOBJ(group: THREE.Group, filename: string): Model {
    const sections = new Map<string, ModelSection>();
    const geometries = new Map<string, Geometry>();
    const materials = new Map<string, Material>();
    const rootSectionIds: string[] = [];

    let sectionCounter = 0;
    let geometryCounter = 0;
    let materialCounter = 0;

    const processNode = (node: THREE.Object3D, parentId?: string): string => {
      const sectionId = `section_${sectionCounter++}`;
      const childIds: string[] = [];

      let geometryId = "";
      if (node instanceof THREE.Mesh && node.geometry) {
        geometryId = `geometry_${geometryCounter++}`;
        geometries.set(
          geometryId,
          this.extractGeometry(node.geometry, geometryId)
        );
      }

      let materialId = "";
      if (node instanceof THREE.Mesh && node.material) {
        materialId = `material_${materialCounter++}`;
        const mat = Array.isArray(node.material)
          ? node.material[0]
          : node.material;
        materials.set(materialId, this.extractMaterial(mat, materialId));
      }

      for (const child of node.children) {
        const childId = processNode(child, sectionId);
        childIds.push(childId);
      }

      const boundingBox = this.calculateBoundingBox(node);
      const section: ModelSection = {
        id: sectionId,
        name: node.name || `Section ${sectionId}`,
        parentId,
        childIds,
        geometryId,
        materialId,
        transform: this.extractTransform(node),
        boundingBox,
        metadata: {},
        visible: true,
        selected: false,
        highlighted: false,
      };

      sections.set(sectionId, section);

      if (!parentId) {
        rootSectionIds.push(sectionId);
      }

      return sectionId;
    };

    for (const child of group.children) {
      processNode(child);
    }

    const box = new THREE.Box3().setFromObject(group);
    const modelBoundingBox: BoundingBox = {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
    };

    return {
      id: `model_${Date.now()}`,
      name: filename,
      format: ModelFormat.OBJ,
      sections,
      geometries,
      materials,
      rootSectionIds,
      boundingBox: modelBoundingBox,
      metadata: {},
    };
  }

  private extractGeometry(
    geometry: THREE.BufferGeometry,
    id: string
  ): Geometry {
    const positionAttr = geometry.getAttribute("position");
    const normalAttr = geometry.getAttribute("normal");
    const uvAttr = geometry.getAttribute("uv");
    const index = geometry.getIndex();

    return {
      id,
      type: geometry.type,
      vertices: Array.from(positionAttr.array),
      indices: index ? Array.from(index.array) : undefined,
      normals: normalAttr ? Array.from(normalAttr.array) : undefined,
      uvs: uvAttr ? Array.from(uvAttr.array) : undefined,
    };
  }

  private extractMaterial(material: THREE.Material, id: string): Material {
    const mat: Material = {
      id,
      name: material.name || id,
    };

    if (
      material instanceof THREE.MeshPhongMaterial ||
      material instanceof THREE.MeshStandardMaterial
    ) {
      mat.color = `#${material.color.getHexString()}`;
      mat.opacity = material.opacity;
      mat.transparent = material.transparent;

      if (material instanceof THREE.MeshStandardMaterial) {
        mat.metalness = material.metalness;
        mat.roughness = material.roughness;
      }
    }

    return mat;
  }

  private extractTransform(node: THREE.Object3D): Transform {
    return {
      position: {
        x: node.position.x,
        y: node.position.y,
        z: node.position.z,
      },
      rotation: {
        x: node.rotation.x,
        y: node.rotation.y,
        z: node.rotation.z,
      },
      scale: {
        x: node.scale.x,
        y: node.scale.y,
        z: node.scale.z,
      },
    };
  }

  private calculateBoundingBox(node: THREE.Object3D): BoundingBox {
    const box = new THREE.Box3().setFromObject(node);
    return {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
    };
  }
}
