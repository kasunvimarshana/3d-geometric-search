/**
 * OBJ/MTL loader implementation
 * Support for Wavefront OBJ format with material files
 */

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import * as THREE from "three";
import { BaseModelLoader } from "./IModelLoader";
import type {
  Model3D,
  ModelSection,
  ModelProperty,
  FileFormat,
} from "../domain/types";

export class OBJModelLoader extends BaseModelLoader {
  readonly supportedFormats: FileFormat[] = ["obj" as FileFormat];
  private objLoader: OBJLoader;
  private mtlLoader: MTLLoader;

  constructor() {
    super();
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
  }

  async load(
    filePath: string,
    fileData: ArrayBuffer | string
  ): Promise<Model3D> {
    return new Promise((resolve, reject) => {
      try {
        const textData =
          typeof fileData === "string"
            ? fileData
            : new TextDecoder().decode(fileData);

        const group = this.objLoader.parse(textData);
        const model = this.parseOBJ(filePath, group);
        resolve(model);
      } catch (error) {
        reject(new Error(`Failed to load OBJ: ${error}`));
      }
    });
  }

  private parseOBJ(filePath: string, group: THREE.Group): Model3D {
    const sections = new Map<string, ModelSection>();
    const modelId = this.generateId();
    const rootSectionId = this.generateId();

    // Parse OBJ hierarchy
    this.traverseObject(group, rootSectionId, sections);

    // Create root section
    const rootSection: ModelSection = {
      id: rootSectionId,
      name: group.name || "OBJ Model",
      type: "assembly",
      parentId: null,
      children: Array.from(sections.values())
        .filter((s) => s.parentId === rootSectionId)
        .map((s) => s.id),
      visible: true,
      selected: false,
      highlighted: false,
      properties: [
        { id: this.generateId(), name: "Type", value: "OBJ", type: "string" },
        {
          id: this.generateId(),
          name: "Objects",
          value: group.children.length,
          type: "number",
        },
      ],
    };

    sections.set(rootSectionId, rootSection);

    return {
      id: modelId,
      name: filePath.split("/").pop()?.split("\\").pop() || "Model",
      format: "obj" as FileFormat,
      rootSectionId,
      sections,
      loadedAt: new Date(),
      metadata: {
        format: "Wavefront OBJ",
      },
      threeScene: group,
    };
  }

  private traverseObject(
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
      this.traverseObject(child, sectionId, sections);
    });
  }

  private determineType(
    object: THREE.Object3D
  ): "assembly" | "part" | "mesh" | "group" {
    if (object instanceof THREE.Mesh) {
      return "mesh";
    } else if (object instanceof THREE.Group || object.children.length > 0) {
      return "assembly";
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
