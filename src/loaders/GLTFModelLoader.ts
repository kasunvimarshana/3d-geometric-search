/**
 * glTF/GLB loader implementation
 * Preferred format for web-based 3D visualization
 */

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { BaseModelLoader } from "./IModelLoader";
import type {
  Model3D,
  ModelSection,
  ModelProperty,
  FileFormat,
} from "../domain/types";

export class GLTFModelLoader extends BaseModelLoader {
  readonly supportedFormats: FileFormat[] = [
    "gltf" as FileFormat,
    "glb" as FileFormat,
  ];
  private loader: GLTFLoader;

  constructor() {
    super();
    this.loader = new GLTFLoader();
  }

  async load(
    filePath: string,
    fileData: ArrayBuffer | string
  ): Promise<Model3D> {
    return new Promise((resolve, reject) => {
      const onLoad = (gltf: GLTF) => {
        try {
          const model = this.parseGLTF(filePath, gltf);
          resolve(model);
        } catch (error) {
          reject(new Error(`Failed to parse glTF: ${error}`));
        }
      };

      const onError = (error: any) => {
        reject(new Error(`Failed to load glTF: ${error}`));
      };

      if (fileData instanceof ArrayBuffer) {
        this.loader.parse(fileData, "", onLoad, onError);
      } else {
        reject(new Error("glTF loader requires ArrayBuffer data"));
      }
    });
  }

  private parseGLTF(filePath: string, gltf: GLTF): Model3D {
    const sections = new Map<string, ModelSection>();
    const modelId = this.generateId();
    const rootSectionId = this.generateId();

    // Parse scene hierarchy
    this.traverseScene(gltf.scene, rootSectionId, sections);

    // Create root section
    const rootSection: ModelSection = {
      id: rootSectionId,
      name: gltf.scene.name || "Scene",
      type: "assembly",
      parentId: null,
      children: Array.from(sections.values())
        .filter((s) => s.parentId === rootSectionId)
        .map((s) => s.id),
      visible: true,
      selected: false,
      highlighted: false,
      properties: [
        { id: this.generateId(), name: "Type", value: "Scene", type: "string" },
        {
          id: this.generateId(),
          name: "Children Count",
          value: gltf.scene.children.length,
          type: "number",
        },
      ],
    };

    sections.set(rootSectionId, rootSection);

    return {
      id: modelId,
      name: filePath.split("/").pop()?.split("\\").pop() || "Model",
      format: this.getFileExtension(filePath) as FileFormat,
      rootSectionId,
      sections,
      loadedAt: new Date(),
      metadata: {
        generator: gltf.asset?.generator,
        version: gltf.asset?.version,
        copyright: gltf.asset?.copyright,
      },
      threeScene: gltf.scene,
    };
  }

  private traverseScene(
    object: THREE.Object3D,
    parentId: string,
    sections: Map<string, ModelSection>
  ): void {
    const sectionId = this.generateId();

    const section: ModelSection = {
      id: sectionId,
      name: object.name || `Object_${sectionId.substring(0, 8)}`,
      type: this.determineType(object),
      parentId,
      children: [],
      visible: object.visible,
      selected: false,
      highlighted: false,
      properties: this.extractProperties(object),
      meshId: object instanceof THREE.Mesh ? object.uuid : undefined,
    };

    sections.set(sectionId, section);

    // Update parent's children
    if (parentId && sections.has(parentId)) {
      const parent = sections.get(parentId)!;
      parent.children.push(sectionId);
    }

    // Recursively process children
    object.children.forEach((child) => {
      this.traverseScene(child, sectionId, sections);
    });
  }

  private determineType(
    object: THREE.Object3D
  ): "assembly" | "part" | "mesh" | "group" {
    if (object instanceof THREE.Mesh) {
      return "mesh";
    } else if (object instanceof THREE.Group || object.children.length > 0) {
      return object.children.length > 1 ? "assembly" : "group";
    }
    return "part";
  }

  private extractProperties(object: THREE.Object3D): ModelProperty[] {
    const properties: ModelProperty[] = [
      {
        id: this.generateId(),
        name: "UUID",
        value: object.uuid,
        type: "string",
      },
      {
        id: this.generateId(),
        name: "Type",
        value: object.type,
        type: "string",
      },
      {
        id: this.generateId(),
        name: "Visible",
        value: object.visible,
        type: "boolean",
      },
    ];

    if (object instanceof THREE.Mesh) {
      properties.push(
        {
          id: this.generateId(),
          name: "Vertices",
          value: object.geometry.attributes.position?.count || 0,
          type: "number",
        },
        {
          id: this.generateId(),
          name: "Faces",
          value: object.geometry.index ? object.geometry.index.count / 3 : 0,
          type: "number",
        }
      );
    }

    return properties;
  }
}
