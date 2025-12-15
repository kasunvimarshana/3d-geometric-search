/**
 * OBJ Loader
 *
 * Handles loading of Wavefront OBJ files with optional MTL material files.
 */

import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { BaseLoader, LoadResult } from "./base-loader.js";
import { Section } from "../domain/models.js";

export class ObjLoader extends BaseLoader {
  constructor() {
    super();
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
  }

  canHandle(extension) {
    return extension === ".obj";
  }

  async load(data, filename) {
    return new Promise((resolve, reject) => {
      try {
        // Convert ArrayBuffer to string if needed
        const objData =
          data instanceof ArrayBuffer ? new TextDecoder().decode(data) : data;

        // Parse OBJ
        const object = this.objLoader.parse(objData);
        object.userData.isModel = true;

        // Extract sections
        const sections = this.extractSections(object);

        // Metadata
        const metadata = {
          format: "OBJ",
          objects: object.children.length,
        };

        resolve(new LoadResult(object, sections, metadata));
      } catch (error) {
        reject(new Error(`Failed to load OBJ: ${error.message}`));
      }
    });
  }

  /**
   * Loads OBJ with MTL material file
   */
  async loadWithMaterials(objData, mtlData, basePath = "") {
    return new Promise((resolve, reject) => {
      try {
        // Load materials first
        const materials = this.mtlLoader.parse(mtlData, basePath);
        materials.preload();

        // Set materials to OBJ loader
        this.objLoader.setMaterials(materials);

        // Load OBJ
        const objText =
          objData instanceof ArrayBuffer
            ? new TextDecoder().decode(objData)
            : objData;

        const object = this.objLoader.parse(objText);
        object.userData.isModel = true;

        const sections = this.extractSections(object);
        const metadata = {
          format: "OBJ+MTL",
          objects: object.children.length,
          materials: Object.keys(materials.materials).length,
        };

        resolve(new LoadResult(object, sections, metadata));
      } catch (error) {
        reject(new Error(`Failed to load OBJ+MTL: ${error.message}`));
      }
    });
  }

  /**
   * Extracts sections from OBJ object
   */
  extractSections(object) {
    const sections = [];
    let sectionIdCounter = 0;

    const traverse = (obj, parentSection = null) => {
      if (obj === object && obj.children.length > 0) {
        obj.children.forEach((child) => traverse(child, null));
        return;
      }

      if (!obj.isMesh && obj.children.length === 0) return;

      const section = new Section({
        id: `section_${sectionIdCounter++}`,
        name: obj.name || `Part ${sectionIdCounter}`,
        type: obj.isMesh ? "part" : "group",
        meshId: obj.uuid,
        properties: {
          type: obj.type,
          uuid: obj.uuid,
        },
        parent: parentSection,
        children: [],
      });

      if (obj.isMesh) {
        section.properties.vertices =
          obj.geometry.attributes.position?.count || 0;
        section.properties.faces = obj.geometry.index
          ? obj.geometry.index.count / 3
          : section.properties.vertices / 3;

        if (obj.material) {
          const mat = obj.material;
          section.properties.material = {
            name: mat.name || "default",
            color: mat.color?.getHexString() || "none",
            type: mat.type,
          };
        }
      }

      if (parentSection) {
        parentSection.children.push(section);
      } else {
        sections.push(section);
      }

      if (obj.children && obj.children.length > 0) {
        obj.children.forEach((child) => traverse(child, section));
      }
    };

    traverse(object);
    return sections;
  }
}
