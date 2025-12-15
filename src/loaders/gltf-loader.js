/**
 * glTF/GLB Loader
 *
 * Handles loading of glTF and GLB format files.
 * These are the preferred formats for web-based 3D applications.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BaseLoader, LoadResult } from "./base-loader.js";
import { Section } from "../domain/models.js";

export class GltfLoader extends BaseLoader {
  constructor() {
    super();
    this.loader = new GLTFLoader();
  }

  canHandle(extension) {
    return extension === ".gltf" || extension === ".glb";
  }

  async load(data, filename) {
    return new Promise((resolve, reject) => {
      const loadData =
        data instanceof ArrayBuffer
          ? URL.createObjectURL(new Blob([data]))
          : data;

      this.loader.load(
        loadData,
        (gltf) => {
          const scene = gltf.scene;
          scene.userData.isModel = true;

          // Extract sections from scene hierarchy
          const sections = this.extractSections(scene);

          // Extract metadata
          const metadata = {
            animations: gltf.animations.length,
            cameras: gltf.cameras.length,
            scenes: gltf.scenes.length,
          };

          if (typeof loadData === "string" && loadData.startsWith("blob:")) {
            URL.revokeObjectURL(loadData);
          }

          resolve(new LoadResult(scene, sections, metadata));
        },
        (progress) => {
          // Progress callback
          console.log(
            "Loading progress:",
            ((progress.loaded / progress.total) * 100).toFixed(2) + "%"
          );
        },
        (error) => {
          if (typeof loadData === "string" && loadData.startsWith("blob:")) {
            URL.revokeObjectURL(loadData);
          }
          reject(new Error(`Failed to load glTF/GLB: ${error.message}`));
        }
      );
    });
  }

  /**
   * Extracts hierarchical sections from glTF scene
   */
  extractSections(sceneObject) {
    const sections = [];
    let sectionIdCounter = 0;

    const traverse = (object, parentSection = null) => {
      // Skip the root scene object
      if (object === sceneObject) {
        object.children.forEach((child) => traverse(child, null));
        return;
      }

      // Create section for this object
      const section = new Section({
        id: `section_${sectionIdCounter++}`,
        name: object.name || `Object ${sectionIdCounter}`,
        type: object.isMesh ? "part" : "assembly",
        meshId: object.uuid,
        properties: {
          type: object.type,
          uuid: object.uuid,
          layers: object.layers.mask,
          visible: object.visible,
          castShadow: object.castShadow,
          receiveShadow: object.receiveShadow,
        },
        parent: parentSection,
        children: [],
      });

      // Add mesh-specific properties
      if (object.isMesh) {
        section.properties.vertices =
          object.geometry.attributes.position?.count || 0;
        section.properties.triangles = object.geometry.index
          ? object.geometry.index.count / 3
          : section.properties.vertices / 3;

        if (object.material) {
          section.properties.material = {
            name: object.material.name || "Unnamed",
            type: object.material.type,
            color: object.material.color?.getHexString() || "none",
          };
        }
      }

      if (parentSection) {
        parentSection.children.push(section);
      } else {
        sections.push(section);
      }

      // Recursively process children
      if (object.children && object.children.length > 0) {
        object.children.forEach((child) => traverse(child, section));
      }
    };

    traverse(sceneObject);
    return sections;
  }
}
