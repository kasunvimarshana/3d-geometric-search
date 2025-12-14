/**
 * Model Export Service
 * Handles exporting 3D models to various formats
 * Following Single Responsibility Principle
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export class ModelExportService {
  constructor() {
    this.gltfExporter = new GLTFExporter();
    this.objExporter = new OBJExporter();
    this.stlExporter = new STLExporter();
  }

  /**
   * Export model to specified format
   * @param {THREE.Object3D} object - Object to export
   * @param {string} format - Export format ('gltf', 'glb', 'obj', 'stl')
   * @param {string} filename - Output filename
   * @returns {Promise<void>}
   */
  async export(object, format, filename) {
    if (!object) {
      throw new Error('No object to export');
    }

    const formatLower = format.toLowerCase();

    try {
      switch (formatLower) {
        case 'gltf':
          await this.exportGLTF(object, filename, false);
          break;
        case 'glb':
          await this.exportGLTF(object, filename, true);
          break;
        case 'obj':
          await this.exportOBJ(object, filename);
          break;
        case 'stl':
          await this.exportSTL(object, filename);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      console.log(`Model exported successfully as ${filename}.${formatLower}`);
    } catch (error) {
      throw new Error(`Failed to export model: ${error.message}`);
    }
  }

  /**
   * Export to GLTF/GLB format
   */
  async exportGLTF(object, filename, binary = false) {
    return new Promise((resolve, reject) => {
      const options = {
        binary: binary,
        embedImages: true,
      };

      this.gltfExporter.parse(
        object,
        result => {
          if (binary) {
            // GLB is ArrayBuffer
            this.downloadFile(result, `${filename}.glb`, 'model/gltf-binary');
          } else {
            // GLTF is JSON
            const json = JSON.stringify(result, null, 2);
            this.downloadFile(json, `${filename}.gltf`, 'application/json');
          }
          resolve();
        },
        error => {
          reject(error);
        },
        options
      );
    });
  }

  /**
   * Export to OBJ format
   */
  async exportOBJ(object, filename) {
    try {
      const result = this.objExporter.parse(object);
      this.downloadFile(result, `${filename}.obj`, 'text/plain');
    } catch (error) {
      throw new Error(`OBJ export failed: ${error.message}`);
    }
  }

  /**
   * Export to STL format
   */
  async exportSTL(object, filename) {
    try {
      const result = this.stlExporter.parse(object);
      this.downloadFile(result, `${filename}.stl`, 'model/stl');
    } catch (error) {
      throw new Error(`STL export failed: ${error.message}`);
    }
  }

  /**
   * Download file to user's computer
   */
  downloadFile(data, filename, mimeType) {
    const blob =
      data instanceof ArrayBuffer
        ? new Blob([data], { type: mimeType })
        : new Blob([data], { type: mimeType });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats() {
    return [
      { value: 'glb', label: 'GLB (Binary glTF)', extension: '.glb' },
      { value: 'gltf', label: 'GLTF (JSON)', extension: '.gltf' },
      { value: 'obj', label: 'OBJ (Wavefront)', extension: '.obj' },
      { value: 'stl', label: 'STL (Stereolithography)', extension: '.stl' },
    ];
  }

  /**
   * Validate object can be exported
   */
  canExport(object) {
    if (!object) return false;

    // Check if object has geometry
    let hasGeometry = false;
    object.traverse(child => {
      if (child.isMesh && child.geometry) {
        hasGeometry = true;
      }
    });

    return hasGeometry;
  }
}
