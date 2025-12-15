const math = require("mathjs");

/**
 * Extract comprehensive geometric features from 3D model
 */
function extractFeatures(geometryData) {
  if (
    !geometryData ||
    !geometryData.vertices ||
    geometryData.vertices.length === 0
  ) {
    throw new Error("Invalid geometry data");
  }

  const features = {
    // Basic counts
    vertexCount: geometryData.vertexCount,
    faceCount: geometryData.faceCount,

    // Geometric descriptors
    ...computeBasicDescriptors(geometryData),
    ...computeBoundingBox(geometryData),
    ...computePrincipalAxes(geometryData),
    ...computeShapeDistribution(geometryData),
    ...computeCurvatureStats(geometryData),

    // Derived metrics
    ...computeDerivedMetrics(geometryData),

    // Topological features
    ...computeTopologicalFeatures(geometryData),

    // Format info
    format: geometryData.format,
  };

  // Normalize features for comparison
  features.normalizedVector = normalizeFeatures(features);

  return features;
}

/**
 * Compute basic geometric descriptors
 */
function computeBasicDescriptors(geometryData) {
  const { vertices, faces } = geometryData;

  let totalSurfaceArea = 0;
  let volume = 0;

  // Calculate surface area and volume
  if (faces && faces.length > 0) {
    for (const face of faces) {
      if (face.length >= 3) {
        const v0 = vertices[face[0]];
        const v1 = vertices[face[1]];
        const v2 = vertices[face[2]];

        // Triangle area
        const area = computeTriangleArea(v0, v1, v2);
        totalSurfaceArea += area;

        // Contribution to volume (tetrahedron from origin)
        const vol = computeTetrahedronVolume({ x: 0, y: 0, z: 0 }, v0, v1, v2);
        volume += vol;
      }
    }
  }

  volume = Math.abs(volume);

  return {
    surfaceArea: totalSurfaceArea,
    volume: volume,
  };
}

/**
 * Compute bounding box and related metrics
 */
function computeBoundingBox(geometryData) {
  const { vertices } = geometryData;

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    minY = Math.min(minY, v.y);
    minZ = Math.min(minZ, v.z);
    maxX = Math.max(maxX, v.x);
    maxY = Math.max(maxY, v.y);
    maxZ = Math.max(maxZ, v.z);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const depth = maxZ - minZ;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return {
    boundingBox: {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center: { x: centerX, y: centerY, z: centerZ },
      dimensions: { width, height, depth },
    },
    width,
    height,
    depth,
    diagonal: Math.sqrt(width * width + height * height + depth * depth),
  };
}

/**
 * Compute principal axes using PCA
 */
function computePrincipalAxes(geometryData) {
  const { vertices } = geometryData;

  // Compute centroid
  let cx = 0,
    cy = 0,
    cz = 0;
  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
    cz += v.z;
  }
  cx /= vertices.length;
  cy /= vertices.length;
  cz /= vertices.length;

  // Build covariance matrix
  let cxx = 0,
    cxy = 0,
    cxz = 0;
  let cyy = 0,
    cyz = 0,
    czz = 0;

  for (const v of vertices) {
    const dx = v.x - cx;
    const dy = v.y - cy;
    const dz = v.z - cz;

    cxx += dx * dx;
    cxy += dx * dy;
    cxz += dx * dz;
    cyy += dy * dy;
    cyz += dy * dz;
    czz += dz * dz;
  }

  const n = vertices.length;
  const covMatrix = [
    [cxx / n, cxy / n, cxz / n],
    [cxy / n, cyy / n, cyz / n],
    [cxz / n, cyz / n, czz / n],
  ];

  // Compute eigenvalues (principal components)
  try {
    const eigs = math.eigs(covMatrix);
    const eigenvalues = eigs.values
      .map((v) => (typeof v === "number" ? v : v.re))
      .sort((a, b) => b - a);

    // Aspect ratios
    const aspectRatio1 =
      eigenvalues[0] > 0 ? eigenvalues[1] / eigenvalues[0] : 0;
    const aspectRatio2 =
      eigenvalues[1] > 0 ? eigenvalues[2] / eigenvalues[1] : 0;

    return {
      principalComponents: eigenvalues,
      aspectRatio1,
      aspectRatio2,
      elongation: eigenvalues[0] > 0 ? Math.sqrt(eigenvalues[0]) : 0,
    };
  } catch (error) {
    return {
      principalComponents: [0, 0, 0],
      aspectRatio1: 0,
      aspectRatio2: 0,
      elongation: 0,
    };
  }
}

/**
 * Compute D2 shape distribution (histogram of pairwise distances)
 */
function computeShapeDistribution(geometryData) {
  const { vertices } = geometryData;
  const sampleSize = Math.min(100, vertices.length); // Sample for performance
  const distances = [];

  // Sample random pairs
  for (let i = 0; i < sampleSize; i++) {
    const idx1 = Math.floor(Math.random() * vertices.length);
    const idx2 = Math.floor(Math.random() * vertices.length);

    if (idx1 !== idx2) {
      const v1 = vertices[idx1];
      const v2 = vertices[idx2];
      const dist = Math.sqrt(
        (v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2 + (v2.z - v1.z) ** 2
      );
      distances.push(dist);
    }
  }

  distances.sort((a, b) => a - b);

  // Compute statistics
  const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
  const variance =
    distances.reduce((a, b) => a + (b - mean) ** 2, 0) / distances.length;
  const stdDev = Math.sqrt(variance);

  // Histogram (10 bins)
  const bins = 10;
  const histogram = new Array(bins).fill(0);
  const minDist = distances[0];
  const maxDist = distances[distances.length - 1];
  const binSize = (maxDist - minDist) / bins;

  for (const dist of distances) {
    const binIdx = Math.min(Math.floor((dist - minDist) / binSize), bins - 1);
    histogram[binIdx]++;
  }

  // Normalize histogram
  const normalizedHistogram = histogram.map(
    (count) => count / distances.length
  );

  return {
    shapeDistribution: {
      mean,
      stdDev,
      histogram: normalizedHistogram,
    },
  };
}

/**
 * Compute curvature statistics
 */
function computeCurvatureStats(geometryData) {
  const { vertices, faces, normals } = geometryData;

  if (!faces || faces.length === 0) {
    return {
      meanCurvature: 0,
      gaussianCurvature: 0,
      curvatureVariance: 0,
    };
  }

  // Simplified curvature estimation based on angle defects
  const vertexAngles = new Array(vertices.length).fill(0);
  const vertexCounts = new Array(vertices.length).fill(0);

  for (const face of faces) {
    if (face.length >= 3) {
      for (let i = 0; i < 3; i++) {
        const idx = face[i];
        const v0 = vertices[face[i]];
        const v1 = vertices[face[(i + 1) % 3]];
        const v2 = vertices[face[(i + 2) % 3]];

        const angle = computeAngle(v0, v1, v2);
        vertexAngles[idx] += angle;
        vertexCounts[idx]++;
      }
    }
  }

  // Compute curvature from angle defect
  const curvatures = [];
  for (let i = 0; i < vertices.length; i++) {
    if (vertexCounts[i] > 0) {
      const angleDefect = 2 * Math.PI - vertexAngles[i];
      curvatures.push(angleDefect);
    }
  }

  const meanCurvature =
    curvatures.length > 0
      ? curvatures.reduce((a, b) => a + b, 0) / curvatures.length
      : 0;

  const variance =
    curvatures.length > 0
      ? curvatures.reduce((a, b) => a + (b - meanCurvature) ** 2, 0) /
        curvatures.length
      : 0;

  return {
    meanCurvature,
    gaussianCurvature: meanCurvature, // Simplified
    curvatureVariance: variance,
  };
}

/**
 * Compute derived metrics
 */
function computeDerivedMetrics(geometryData) {
  const { vertices } = geometryData;

  // Compute features from already computed values
  const surfaceArea = geometryData.surfaceArea || 0;
  const volume = geometryData.volume || 0;

  // Sphericity: ratio of surface area of sphere with same volume to actual surface area
  const sphereRadius = Math.cbrt((3 * volume) / (4 * Math.PI));
  const sphereSurfaceArea = 4 * Math.PI * sphereRadius * sphereRadius;
  const sphericity = surfaceArea > 0 ? sphereSurfaceArea / surfaceArea : 0;

  // Compactness: surface area to volume ratio
  const compactness = volume > 0 ? surfaceArea / Math.cbrt(volume * volume) : 0;

  return {
    sphericity: Math.min(sphericity, 1.0), // Cap at 1.0
    compactness,
  };
}

/**
 * Compute topological features
 */
function computeTopologicalFeatures(geometryData) {
  const { vertices, faces } = geometryData;

  // Euler characteristic: V - E + F
  // For a closed mesh: chi = 2(1 - g) where g is genus
  const V = vertices.length;
  const F = faces ? faces.length : 0;

  // Estimate edges (each face has 3 edges, shared edges counted twice)
  const E = (F * 3) / 2;

  const eulerCharacteristic = V - E + F;
  const genus = Math.max(0, Math.round((2 - eulerCharacteristic) / 2));

  return {
    eulerCharacteristic,
    genus,
    isManifold: eulerCharacteristic === 2, // Simple check for closed manifold
  };
}

/**
 * Normalize features to unit scale for comparison
 */
function normalizeFeatures(features) {
  const vector = [
    features.surfaceArea || 0,
    features.volume || 0,
    features.width || 0,
    features.height || 0,
    features.depth || 0,
    features.diagonal || 0,
    features.sphericity || 0,
    features.compactness || 0,
    features.aspectRatio1 || 0,
    features.aspectRatio2 || 0,
    features.meanCurvature || 0,
    features.gaussianCurvature || 0,
    ...(features.shapeDistribution?.histogram || []),
  ];

  // Normalize to unit vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

// Helper functions

function computeTriangleArea(v0, v1, v2) {
  // Using cross product
  const ax = v1.x - v0.x;
  const ay = v1.y - v0.y;
  const az = v1.z - v0.z;

  const bx = v2.x - v0.x;
  const by = v2.y - v0.y;
  const bz = v2.z - v0.z;

  const cx = ay * bz - az * by;
  const cy = az * bx - ax * bz;
  const cz = ax * by - ay * bx;

  return 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
}

function computeTetrahedronVolume(v0, v1, v2, v3) {
  // Volume = |det(v1-v0, v2-v0, v3-v0)| / 6
  const ax = v1.x - v0.x,
    ay = v1.y - v0.y,
    az = v1.z - v0.z;
  const bx = v2.x - v0.x,
    by = v2.y - v0.y,
    bz = v2.z - v0.z;
  const cx = v3.x - v0.x,
    cy = v3.y - v0.y,
    cz = v3.z - v0.z;

  return (
    (ax * (by * cz - bz * cy) -
      ay * (bx * cz - bz * cx) +
      az * (bx * cy - by * cx)) /
    6
  );
}

function computeAngle(v0, v1, v2) {
  const a = {
    x: v1.x - v0.x,
    y: v1.y - v0.y,
    z: v1.z - v0.z,
  };

  const b = {
    x: v2.x - v0.x,
    y: v2.y - v0.y,
    z: v2.z - v0.z,
  };

  const dotProduct = a.x * b.x + a.y * b.y + a.z * b.z;
  const magA = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
  const magB = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);

  if (magA === 0 || magB === 0) return 0;

  const cosAngle = dotProduct / (magA * magB);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

module.exports = {
  extractFeatures,
};
