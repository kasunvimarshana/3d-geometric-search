/**
 * Export Manager Module
 * Handles exporting models, analysis data, and screenshots
 */

import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { OBJExporter } from "three/addons/exporters/OBJExporter.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import { downloadFile } from "./utils.js";
import Config from "./config.js";

export class ExportManager {
  constructor() {
    this.gltfExporter = new GLTFExporter();
    this.objExporter = new OBJExporter();
    this.stlExporter = new STLExporter();
  }

  /**
   * Export model to glTF format
   * @param {THREE.Object3D} object - 3D object to export
   * @param {string} filename - Output filename
   * @param {boolean} binary - Export as GLB (binary) if true
   */
  exportGLTF(object, filename = "model", binary = false) {
    const options = {
      binary: binary,
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
    };

    this.gltfExporter.parse(
      object,
      (result) => {
        if (binary) {
          const blob = new Blob([result], { type: "application/octet-stream" });
          this.downloadBlob(blob, `${filename}.glb`);
        } else {
          const output = JSON.stringify(result, null, Config.export.jsonIndent);
          downloadFile(output, `${filename}.gltf`, "application/json");
        }
      },
      (error) => {
        console.error("Error exporting glTF:", error);
        throw new Error("Failed to export glTF");
      },
      options
    );
  }

  /**
   * Export model to OBJ format
   * @param {THREE.Object3D} object - 3D object to export
   * @param {string} filename - Output filename
   */
  exportOBJ(object, filename = "model") {
    try {
      const result = this.objExporter.parse(object);
      downloadFile(result, `${filename}.obj`, "text/plain");
    } catch (error) {
      console.error("Error exporting OBJ:", error);
      throw new Error("Failed to export OBJ");
    }
  }

  /**
   * Export model to STL format
   * @param {THREE.Object3D} object - 3D object to export
   * @param {string} filename - Output filename
   * @param {boolean} binary - Export as binary STL if true
   */
  exportSTL(object, filename = "model", binary = true) {
    try {
      const result = this.stlExporter.parse(object, { binary: binary });

      if (binary) {
        const blob = new Blob([result], { type: "application/octet-stream" });
        this.downloadBlob(blob, `${filename}.stl`);
      } else {
        downloadFile(result, `${filename}.stl`, "text/plain");
      }
    } catch (error) {
      console.error("Error exporting STL:", error);
      throw new Error("Failed to export STL");
    }
  }

  /**
   * Export geometry analysis data
   * @param {Object} features - Geometry features object
   * @param {string} filename - Output filename
   * @param {string} format - Export format: 'json' or 'csv'
   */
  exportAnalysisData(features, filename = "analysis", format = "json") {
    if (format === "json") {
      const output = JSON.stringify(features, null, Config.export.jsonIndent);
      downloadFile(output, `${filename}.json`, "application/json");
    } else if (format === "csv") {
      const csv = this.convertToCSV(features);
      downloadFile(csv, `${filename}.csv`, "text/csv");
    }
  }

  /**
   * Export multiple models' analysis data
   * @param {Object} modelLibrary - Library of models with features
   * @param {string} filename - Output filename
   */
  exportBatchAnalysis(modelLibrary, filename = "batch_analysis") {
    const data = {};

    for (const [name, model] of Object.entries(modelLibrary)) {
      data[name] = {
        fileName: model.fileName,
        features: model.features,
      };
    }

    const output = JSON.stringify(data, null, Config.export.jsonIndent);
    downloadFile(output, `${filename}.json`, "application/json");
  }

  /**
   * Export similarity comparison results
   * @param {Array} similarityResults - Array of similarity results
   * @param {string} filename - Output filename
   */
  exportSimilarityResults(similarityResults, filename = "similarity") {
    const output = JSON.stringify(
      similarityResults,
      null,
      Config.export.jsonIndent
    );
    downloadFile(output, `${filename}.json`, "application/json");
  }

  /**
   * Capture screenshot of the 3D viewer
   * @param {THREE.WebGLRenderer} renderer - Three.js renderer
   * @param {string} filename - Output filename
   * @param {number} width - Image width (optional)
   * @param {number} height - Image height (optional)
   */
  captureScreenshot(
    renderer,
    filename = "screenshot",
    width = null,
    height = null
  ) {
    try {
      // Store original size
      const originalSize = renderer.getSize(new THREE.Vector2());

      // Set custom size if provided
      if (width && height) {
        renderer.setSize(width, height);
        renderer.render(renderer.scene, renderer.camera);
      }

      // Get image data
      const canvas = renderer.domElement;
      canvas.toBlob(
        (blob) => {
          this.downloadBlob(blob, `${filename}.${Config.export.imageFormat}`);

          // Restore original size
          if (width && height) {
            renderer.setSize(originalSize.x, originalSize.y);
          }
        },
        `image/${Config.export.imageFormat}`,
        Config.export.imageQuality
      );
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      throw new Error("Failed to capture screenshot");
    }
  }

  /**
   * Export project state (models + analysis)
   * @param {Object} modelLibrary - Model library
   * @param {string} filename - Output filename
   */
  exportProject(modelLibrary, filename = "project") {
    const projectData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      models: {},
    };

    for (const [name, model] of Object.entries(modelLibrary)) {
      projectData.models[name] = {
        fileName: model.fileName,
        features: model.features,
        thumbnail: model.thumbnail,
      };
    }

    const output = JSON.stringify(projectData, null, Config.export.jsonIndent);
    downloadFile(output, `${filename}.json`, "application/json");
  }

  /**
   * Convert features object to CSV format
   * @param {Object} features - Features object
   * @returns {string} CSV string
   */
  convertToCSV(features) {
    const rows = [];
    rows.push("Property,Value");

    // Basic properties
    rows.push(`Name,${features.name}`);
    rows.push(`Vertex Count,${features.vertexCount}`);
    rows.push(`Face Count,${features.faceCount}`);
    rows.push(`Volume,${features.volume}`);
    rows.push(`Surface Area,${features.surfaceArea}`);
    rows.push(`Compactness,${features.compactness}`);
    rows.push(`Aspect Ratio,${features.aspectRatio}`);

    // Bounding box
    if (features.boundingBox) {
      rows.push(`Bounding Box X,${features.boundingBox.x}`);
      rows.push(`Bounding Box Y,${features.boundingBox.y}`);
      rows.push(`Bounding Box Z,${features.boundingBox.z}`);
    }

    // Center of mass
    if (features.centerOfMass) {
      rows.push(`Center X,${features.centerOfMass.x}`);
      rows.push(`Center Y,${features.centerOfMass.y}`);
      rows.push(`Center Z,${features.centerOfMass.z}`);
    }

    return rows.join("\n");
  }

  /**
   * Helper to download blob
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate report HTML
   * @param {Object} modelLibrary - Model library
   * @returns {string} HTML report
   */
  generateHTMLReport(modelLibrary) {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Model Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        h2 { color: #764ba2; margin-top: 30px; }
        .model-section { margin: 20px 0; padding: 20px; background: #f8f9ff; border-radius: 8px; }
        .thumbnail { max-width: 300px; border-radius: 5px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>3D Model Analysis Report</h1>
        <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
`;

    for (const [name, model] of Object.entries(modelLibrary)) {
      html += `
        <div class="model-section">
            <h2>${name}</h2>
            <img src="${model.thumbnail}" alt="${name}" class="thumbnail">
            <table>
                <tr><th>Property</th><th>Value</th></tr>
                <tr><td>File Name</td><td>${model.fileName}</td></tr>
                <tr><td>Vertex Count</td><td>${model.features.vertexCount.toLocaleString()}</td></tr>
                <tr><td>Face Count</td><td>${Math.round(
                  model.features.faceCount
                ).toLocaleString()}</td></tr>
                <tr><td>Volume</td><td>${model.features.volume.toFixed(
                  4
                )}</td></tr>
                <tr><td>Surface Area</td><td>${model.features.surfaceArea.toFixed(
                  4
                )}</td></tr>
                <tr><td>Compactness</td><td>${model.features.compactness.toFixed(
                  4
                )}</td></tr>
                <tr><td>Aspect Ratio</td><td>${model.features.aspectRatio.toFixed(
                  4
                )}</td></tr>
                <tr><td>Bounding Box</td><td>${model.features.boundingBox.x.toFixed(
                  2
                )} × ${model.features.boundingBox.y.toFixed(
        2
      )} × ${model.features.boundingBox.z.toFixed(2)}</td></tr>
            </table>
        </div>
`;
    }

    html += `
    </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Export HTML report
   * @param {Object} modelLibrary - Model library
   * @param {string} filename - Output filename
   */
  exportHTMLReport(modelLibrary, filename = "report") {
    const html = this.generateHTMLReport(modelLibrary);
    downloadFile(html, `${filename}.html`, "text/html");
  }
}

export default ExportManager;
