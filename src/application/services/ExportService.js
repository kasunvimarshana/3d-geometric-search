/**
 * Export Service
 * Implements IExportService interface
 * Handles model export to various formats
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export class ExportService {
  constructor(modelRepository) {
    this.modelRepository = modelRepository;
    this.exporters = {
      gltf: new GLTFExporter(),
      glb: new GLTFExporter(),
      obj: new OBJExporter(),
      stl: new STLExporter(),
    };
  }

  /**
   * Export model to specified format
   *
   * @param {string} modelId - Model ID
   * @param {string} format - Export format (gltf, glb, obj, stl)
   * @param {Object} [options] - Export options
   * @returns {Promise<Blob|string>}
   */
  async export(modelId, format, options = {}) {
    const model = this.modelRepository.findById(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const threeObject = this.modelRepository.getThreeObject(modelId);
    if (!threeObject) {
      throw new Error(`Three.js object not found for model: ${modelId}`);
    }

    const formatLower = format.toLowerCase();

    switch (formatLower) {
      case 'gltf':
        return this.exportGLTF(threeObject, false, options);

      case 'glb':
        return this.exportGLTF(threeObject, true, options);

      case 'obj':
        return this.exportOBJ(threeObject, options);

      case 'stl':
        return this.exportSTL(threeObject, options);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to glTF/GLB
   *
   * @param {THREE.Object3D} object - Object to export
   * @param {boolean} binary - Export as binary (GLB)
   * @param {Object} options - Export options
   * @returns {Promise<Blob|string>}
   */
  async exportGLTF(object, binary, options = {}) {
    const exporter = this.exporters.gltf;

    const exportOptions = {
      binary,
      onlyVisible: options.onlyVisible !== false,
      embedImages: binary || options.embedImages !== false,
      maxTextureSize: options.maxTextureSize || 4096,
      ...options,
    };

    return new Promise((resolve, reject) => {
      exporter.parse(
        object,
        result => {
          if (binary) {
            // GLB - return as Blob
            resolve(new Blob([result], { type: 'model/gltf-binary' }));
          } else {
            // glTF JSON - return as string or Blob
            const json = JSON.stringify(result, null, 2);
            resolve(options.asBlob ? new Blob([json], { type: 'model/gltf+json' }) : json);
          }
        },
        error => reject(new Error(`glTF export failed: ${error.message}`)),
        exportOptions
      );
    });
  }

  /**
   * Export to OBJ
   *
   * @param {THREE.Object3D} object - Object to export
   * @param {Object} options - Export options
   * @returns {string|Blob}
   */
  exportOBJ(object, options = {}) {
    const exporter = this.exporters.obj;

    try {
      const result = exporter.parse(object);

      return options.asBlob ? new Blob([result], { type: 'model/obj' }) : result;
    } catch (error) {
      throw new Error(`OBJ export failed: ${error.message}`);
    }
  }

  /**
   * Export to STL
   *
   * @param {THREE.Object3D} object - Object to export
   * @param {Object} options - Export options
   * @returns {string|Blob}
   */
  exportSTL(object, options = {}) {
    const exporter = this.exporters.stl;
    const binary = options.binary !== false; // Default to binary

    try {
      const result = exporter.parse(object, { binary });

      if (binary) {
        // Binary STL - ArrayBuffer
        return new Blob([result], { type: 'application/sla' });
      } else {
        // ASCII STL - string
        return options.asBlob ? new Blob([result], { type: 'application/sla' }) : result;
      }
    } catch (error) {
      throw new Error(`STL export failed: ${error.message}`);
    }
  }

  /**
   * Download exported model
   *
   * @param {Blob|string} data - Export data
   * @param {string} filename - Filename
   */
  download(data, filename) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Get supported export formats
   *
   * @returns {string[]}
   */
  getSupportedFormats() {
    return Object.keys(this.exporters);
  }

  /**
   * Check if format is supported
   *
   * @param {string} format - Format name
   * @returns {boolean}
   */
  supportsFormat(format) {
    return format.toLowerCase() in this.exporters;
  }

  /**
   * Get format info
   *
   * @param {string} format - Format name
   * @returns {Object}
   */
  getFormatInfo(format) {
    const info = {
      gltf: {
        name: 'glTF 2.0',
        extension: '.gltf',
        mimeType: 'model/gltf+json',
        description: 'GL Transmission Format (JSON)',
        binary: false,
      },
      glb: {
        name: 'glTF Binary',
        extension: '.glb',
        mimeType: 'model/gltf-binary',
        description: 'GL Transmission Format (Binary)',
        binary: true,
      },
      obj: {
        name: 'Wavefront OBJ',
        extension: '.obj',
        mimeType: 'model/obj',
        description: 'Wavefront Object File',
        binary: false,
      },
      stl: {
        name: 'STL',
        extension: '.stl',
        mimeType: 'application/sla',
        description: 'Stereolithography',
        binary: true,
      },
    };

    return info[format.toLowerCase()] || null;
  }

  /**
   * Dispose resources
   */
  dispose() {
    // Exporters don't require explicit disposal
    this.exporters = {};
  }
}
