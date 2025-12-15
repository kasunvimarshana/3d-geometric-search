/**
 * Geometric Feature Extraction
 * Extracts shape descriptors for geometric search
 */

import { traverseNodes } from "./modelUtils.js";

/**
 * Extracts geometric features from a model
 * @param {Model3D} model - 3D model
 * @returns {GeometricFeatures}
 */
export function extractFeatures(model) {
  if (!model || !model.root) {
    return createEmptyFeatures();
  }

  const features = {
    volume: 0,
    surfaceArea: 0,
    centroid: { x: 0, y: 0, z: 0 },
    histogram: new Array(32).fill(0),
    bounds: model.bounds,
  };

  let totalVertices = 0;
  let sumX = 0,
    sumY = 0,
    sumZ = 0;

  traverseNodes(model.root, (node) => {
    if (node.geometry && node.geometry.vertices) {
      const vertices = node.geometry.vertices;
      totalVertices += vertices.length / 3;

      for (let i = 0; i < vertices.length; i += 3) {
        sumX += vertices[i];
        sumY += vertices[i + 1];
        sumZ += vertices[i + 2];
      }

      // Simple surface area approximation
      if (node.geometry.indices) {
        features.surfaceArea += estimateSurfaceArea(node.geometry);
      }
    }
  });

  // Calculate centroid
  if (totalVertices > 0) {
    features.centroid = {
      x: sumX / totalVertices,
      y: sumY / totalVertices,
      z: sumZ / totalVertices,
    };
  }

  // Generate shape histogram
  features.histogram = generateShapeHistogram(model);

  // Estimate volume
  features.volume = estimateVolume(model.bounds);

  return features;
}

/**
 * Estimates surface area from geometry
 * @param {Object} geometry - Geometry object
 * @returns {number}
 */
function estimateSurfaceArea(geometry) {
  if (!geometry.vertices || !geometry.indices) {
    return 0;
  }

  const vertices = geometry.vertices;
  const indices = geometry.indices;
  let area = 0;

  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3;
    const i1 = indices[i + 1] * 3;
    const i2 = indices[i + 2] * 3;

    const v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]];
    const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
    const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];

    area += triangleArea(v0, v1, v2);
  }

  return area;
}

/**
 * Calculates triangle area
 * @param {number[]} v0 - Vertex 0
 * @param {number[]} v1 - Vertex 1
 * @param {number[]} v2 - Vertex 2
 * @returns {number}
 */
function triangleArea(v0, v1, v2) {
  const ax = v1[0] - v0[0];
  const ay = v1[1] - v0[1];
  const az = v1[2] - v0[2];

  const bx = v2[0] - v0[0];
  const by = v2[1] - v0[1];
  const bz = v2[2] - v0[2];

  const cx = ay * bz - az * by;
  const cy = az * bx - ax * bz;
  const cz = ax * by - ay * bx;

  return 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
}

/**
 * Estimates volume from bounding box
 * @param {BoundingBox} bounds - Bounding box
 * @returns {number}
 */
function estimateVolume(bounds) {
  const dx = bounds.max.x - bounds.min.x;
  const dy = bounds.max.y - bounds.min.y;
  const dz = bounds.max.z - bounds.min.z;
  return dx * dy * dz;
}

/**
 * Generates shape histogram descriptor
 * @param {Model3D} model - 3D model
 * @returns {number[]}
 */
function generateShapeHistogram(model) {
  const histogram = new Array(32).fill(0);
  const bins = histogram.length;

  traverseNodes(model.root, (node) => {
    if (node.geometry && node.geometry.vertices) {
      const vertices = node.geometry.vertices;

      // Simple distance-based histogram
      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];
        const dist = Math.sqrt(x * x + y * y + z * z);

        const binIndex = Math.floor((dist / 100) * (bins - 1));
        const clampedIndex = Math.min(Math.max(0, binIndex), bins - 1);
        histogram[clampedIndex]++;
      }
    }
  });

  // Normalize histogram
  const sum = histogram.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    for (let i = 0; i < histogram.length; i++) {
      histogram[i] /= sum;
    }
  }

  return histogram;
}

/**
 * Compares two feature sets and returns similarity score (0-1)
 * @param {GeometricFeatures} features1 - First feature set
 * @param {GeometricFeatures} features2 - Second feature set
 * @returns {number} - Similarity score
 */
export function compareSimilarity(features1, features2) {
  if (!features1 || !features2) {
    return 0;
  }

  // Histogram correlation
  const histogramSimilarity = correlate(
    features1.histogram,
    features2.histogram
  );

  // Volume similarity
  const volumeRatio =
    Math.min(features1.volume, features2.volume) /
    Math.max(features1.volume, features2.volume);

  // Surface area similarity
  const areaSimilarity =
    Math.min(features1.surfaceArea, features2.surfaceArea) /
    Math.max(features1.surfaceArea, features2.surfaceArea);

  // Weighted combination
  return histogramSimilarity * 0.5 + volumeRatio * 0.25 + areaSimilarity * 0.25;
}

/**
 * Calculates correlation between two arrays
 * @param {number[]} a - First array
 * @param {number[]} b - Second array
 * @returns {number}
 */
function correlate(a, b) {
  if (a.length !== b.length) return 0;

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.min(a[i], b[i]);
  }

  return sum;
}

/**
 * Creates empty feature set
 * @returns {GeometricFeatures}
 */
function createEmptyFeatures() {
  return {
    volume: 0,
    surfaceArea: 0,
    centroid: { x: 0, y: 0, z: 0 },
    histogram: new Array(32).fill(0),
    bounds: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    },
  };
}
