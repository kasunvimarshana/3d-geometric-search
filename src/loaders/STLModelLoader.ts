/**
 * STL loader implementation
 * Support for stereolithography CAD format
 */

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import { BaseModelLoader } from "./IModelLoader";
import type { Model3D, ModelSection, FileFormat } from "../domain/types";

export class STLModelLoader extends BaseModelLoader {
  readonly supportedFormats: FileFormat[] = ["stl" as FileFormat];
  private loader: STLLoader;

  constructor() {
    super();
    this.loader = new STLLoader();
  }

  async load(
    filePath: string,
    fileData: ArrayBuffer | string
  ): Promise<Model3D> {
    return new Promise((resolve, reject) => {
      try {
        const arrayBuffer =
          fileData instanceof ArrayBuffer
            ? fileData
            : new TextEncoder().encode(fileData).buffer;

        const geometry = this.loader.parse(arrayBuffer);
        const model = this.parseSTL(filePath, geometry);
        resolve(model);
      } catch (error) {
        reject(new Error(`Failed to load STL: ${error}`));
      }
    });
  }

  private parseSTL(filePath: string, geometry: THREE.BufferGeometry): Model3D {
    const sections = new Map<string, ModelSection>();
    const modelId = this.generateId();
    const rootSectionId = this.generateId();
    const meshSectionId = this.generateId();

    // STL typically contains a single mesh
    const meshSection: ModelSection = {
      id: meshSectionId,
      name: "STL Mesh",
      type: "mesh",
      parentId: rootSectionId,
      children: [],
      visible: true,
      selected: false,
      highlighted: false,
      properties: [
        {
          id: this.generateId(),
          name: "Vertices",
          value: geometry.attributes.position?.count || 0,
          type: "number",
        },
        {
          id: this.generateId(),
          name: "Faces",
          value: geometry.index
            ? geometry.index.count / 3
            : geometry.attributes.position.count / 3,
          type: "number",
        },
        {
          id: this.generateId(),
          name: "Has Normals",
          value: !!geometry.attributes.normal,
          type: "boolean",
        },
      ],
      meshId: geometry.uuid,
    };

    sections.set(meshSectionId, meshSection);

    // Create root section
    const rootSection: ModelSection = {
      id: rootSectionId,
      name: "STL Model",
      type: "part",
      parentId: null,
      children: [meshSectionId],
      visible: true,
      selected: false,
      highlighted: false,
      properties: [
        { id: this.generateId(), name: "Type", value: "STL", type: "string" },
        {
          id: this.generateId(),
          name: "Format",
          value: "Stereolithography",
          type: "string",
        },
      ],
    };

    sections.set(rootSectionId, rootSection);

    // Create a mesh from the geometry for rendering
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "STL Model";

    return {
      id: modelId,
      name: filePath.split("/").pop()?.split("\\").pop() || "Model",
      format: this.getFileExtension(filePath) as FileFormat,
      rootSectionId,
      sections,
      loadedAt: new Date(),
      metadata: {
        format: "STL",
      },
      threeScene: mesh,
    };
  }
}
