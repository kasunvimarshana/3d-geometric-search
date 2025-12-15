/**
 * STL Loader
 *
 * Handles loading of STL (Stereolithography) files.
 * Common format for 3D printing and CAD data.
 */

import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { BaseLoader, LoadResult } from "./base-loader.js";
import { Section } from "../domain/models.js";

export class StlLoader extends BaseLoader {
  constructor() {
    super();
    this.loader = new STLLoader();
  }

  canHandle(extension) {
    return extension === ".stl";
  }

  async load(data, filename) {
    return new Promise((resolve, reject) => {
      try {
        // STL loader expects ArrayBuffer
        const bufferData =
          data instanceof ArrayBuffer
            ? data
            : new TextEncoder().encode(data).buffer;

        const geometry = this.loader.parse(bufferData);

        // Compute normals if not present
        if (!geometry.attributes.normal) {
          geometry.computeVertexNormals();
        }

        // Center geometry
        geometry.center();

        // Create material
        const material = new THREE.MeshStandardMaterial({
          color: 0x909090,
          metalness: 0.3,
          roughness: 0.6,
          flatShading: false,
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = filename.replace(".stl", "");

        // Create group as scene root
        const group = new THREE.Group();
        group.add(mesh);
        group.userData.isModel = true;

        // Create single section (STL doesn't support hierarchy)
        const section = new Section({
          id: "section_0",
          name: mesh.name,
          type: "part",
          meshId: mesh.uuid,
          properties: {
            vertices: geometry.attributes.position.count,
            triangles: geometry.attributes.position.count / 3,
            format: "STL",
            bounded: true,
          },
          children: [],
        });

        const metadata = {
          format: "STL",
          vertices: geometry.attributes.position.count,
          triangles: geometry.attributes.position.count / 3,
        };

        resolve(new LoadResult(group, [section], metadata));
      } catch (error) {
        reject(new Error(`Failed to load STL: ${error.message}`));
      }
    });
  }
}
