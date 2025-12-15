/**
 * Find similar models based on geometric feature comparison
 */
function findSimilar(queryFeatures, allModels, options = {}) {
  const {
    threshold = 0.7,
    limit = 10,
    weights = getDefaultWeights(),
  } = options;

  const results = [];

  for (const model of allModels) {
    try {
      const modelFeatures = JSON.parse(model.features);

      // Compute similarity score
      const similarity = computeSimilarity(
        queryFeatures,
        modelFeatures,
        weights
      );

      if (similarity >= threshold) {
        results.push({
          modelId: model.id,
          filename: model.filename,
          format: model.format,
          similarity: similarity,
          features: modelFeatures,
          featureComparison: compareFeatures(queryFeatures, modelFeatures),
        });
      }
    } catch (error) {
      console.error(`Error processing model ${model.id}:`, error);
    }
  }

  // Sort by similarity (descending)
  results.sort((a, b) => b.similarity - a.similarity);

  // Limit results
  return results.slice(0, limit);
}

/**
 * Compute similarity between two feature sets
 * Uses multiple similarity metrics and combines them
 */
function computeSimilarity(features1, features2, weights) {
  // 1. Cosine similarity on normalized feature vectors
  const cosineSim = cosineSimilarity(
    features1.normalizedVector,
    features2.normalizedVector
  );

  // 2. Euclidean distance similarity (inverted and normalized)
  const euclideanSim = euclideanSimilarity(features1, features2);

  // 3. Feature-specific similarity
  const featureSim = featureSpecificSimilarity(features1, features2, weights);

  // 4. Shape distribution similarity
  const shapeSim = shapeDistributionSimilarity(features1, features2);

  // Combine similarities with weights
  const combinedSimilarity =
    weights.cosine * cosineSim +
    weights.euclidean * euclideanSim +
    weights.features * featureSim +
    weights.shape * shapeSim;

  return Math.max(0, Math.min(1, combinedSimilarity));
}

/**
 * Cosine similarity between two normalized vectors
 */
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    return 0;
  }

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }

  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);

  if (mag1 === 0 || mag2 === 0) return 0;

  return dotProduct / (mag1 * mag2);
}

/**
 * Euclidean distance-based similarity
 */
function euclideanSimilarity(features1, features2) {
  const featureKeys = [
    "surfaceArea",
    "volume",
    "width",
    "height",
    "depth",
    "diagonal",
    "sphericity",
    "compactness",
    "aspectRatio1",
    "aspectRatio2",
  ];

  let sumSquaredDiff = 0;
  let count = 0;

  for (const key of featureKeys) {
    const val1 = features1[key] || 0;
    const val2 = features2[key] || 0;

    // Normalize by the maximum value to get relative difference
    const maxVal = Math.max(Math.abs(val1), Math.abs(val2), 1);
    const normalizedDiff = (val1 - val2) / maxVal;

    sumSquaredDiff += normalizedDiff * normalizedDiff;
    count++;
  }

  const distance = Math.sqrt(sumSquaredDiff / count);

  // Convert distance to similarity (0 distance = 1 similarity)
  return Math.exp(-distance);
}

/**
 * Feature-specific similarity with custom weights
 */
function featureSpecificSimilarity(features1, features2, weights) {
  const comparisons = {
    volume: compareNumeric(features1.volume, features2.volume),
    surfaceArea: compareNumeric(features1.surfaceArea, features2.surfaceArea),
    boundingBox: compareBoundingBox(
      features1.boundingBox,
      features2.boundingBox
    ),
    sphericity: compareNumeric(features1.sphericity, features2.sphericity),
    compactness: compareNumeric(features1.compactness, features2.compactness),
    aspectRatios: compareAspectRatios(features1, features2),
    curvature: compareCurvature(features1, features2),
  };

  // Weighted average
  const featureWeights = {
    volume: 0.15,
    surfaceArea: 0.15,
    boundingBox: 0.15,
    sphericity: 0.15,
    compactness: 0.1,
    aspectRatios: 0.15,
    curvature: 0.15,
  };

  let totalSimilarity = 0;
  let totalWeight = 0;

  for (const [key, similarity] of Object.entries(comparisons)) {
    const weight = featureWeights[key] || 0;
    totalSimilarity += similarity * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
}

/**
 * Shape distribution similarity using histogram comparison
 */
function shapeDistributionSimilarity(features1, features2) {
  const hist1 = features1.shapeDistribution?.histogram;
  const hist2 = features2.shapeDistribution?.histogram;

  if (!hist1 || !hist2 || hist1.length !== hist2.length) {
    return 0;
  }

  // Use histogram intersection
  let intersection = 0;
  for (let i = 0; i < hist1.length; i++) {
    intersection += Math.min(hist1[i], hist2[i]);
  }

  return intersection;
}

/**
 * Compare numeric features with tolerance
 */
function compareNumeric(val1, val2, tolerance = 0.2) {
  val1 = val1 || 0;
  val2 = val2 || 0;

  if (val1 === 0 && val2 === 0) return 1;

  const maxVal = Math.max(Math.abs(val1), Math.abs(val2));
  if (maxVal === 0) return 1;

  const relativeDiff = Math.abs(val1 - val2) / maxVal;

  if (relativeDiff <= tolerance) {
    return 1 - relativeDiff / tolerance;
  }

  return Math.exp(-relativeDiff);
}

/**
 * Compare bounding boxes
 */
function compareBoundingBox(bb1, bb2) {
  if (!bb1 || !bb2) return 0;

  const dim1 = bb1.dimensions || {};
  const dim2 = bb2.dimensions || {};

  const widthSim = compareNumeric(dim1.width, dim2.width);
  const heightSim = compareNumeric(dim1.height, dim2.height);
  const depthSim = compareNumeric(dim1.depth, dim2.depth);

  return (widthSim + heightSim + depthSim) / 3;
}

/**
 * Compare aspect ratios
 */
function compareAspectRatios(features1, features2) {
  const ar1_1 = features1.aspectRatio1 || 0;
  const ar1_2 = features1.aspectRatio2 || 0;
  const ar2_1 = features2.aspectRatio1 || 0;
  const ar2_2 = features2.aspectRatio2 || 0;

  const sim1 = compareNumeric(ar1_1, ar2_1, 0.3);
  const sim2 = compareNumeric(ar1_2, ar2_2, 0.3);

  return (sim1 + sim2) / 2;
}

/**
 * Compare curvature statistics
 */
function compareCurvature(features1, features2) {
  const meanSim = compareNumeric(
    features1.meanCurvature,
    features2.meanCurvature,
    0.3
  );

  const gaussianSim = compareNumeric(
    features1.gaussianCurvature,
    features2.gaussianCurvature,
    0.3
  );

  return (meanSim + gaussianSim) / 2;
}

/**
 * Get detailed feature comparison
 */
function compareFeatures(features1, features2) {
  return {
    volume: {
      query: features1.volume,
      match: features2.volume,
      similarity: compareNumeric(features1.volume, features2.volume),
    },
    surfaceArea: {
      query: features1.surfaceArea,
      match: features2.surfaceArea,
      similarity: compareNumeric(features1.surfaceArea, features2.surfaceArea),
    },
    sphericity: {
      query: features1.sphericity,
      match: features2.sphericity,
      similarity: compareNumeric(features1.sphericity, features2.sphericity),
    },
    aspectRatio: {
      query: [features1.aspectRatio1, features1.aspectRatio2],
      match: [features2.aspectRatio1, features2.aspectRatio2],
      similarity: compareAspectRatios(features1, features2),
    },
  };
}

/**
 * Default weight configuration for similarity computation
 */
function getDefaultWeights() {
  return {
    cosine: 0.3, // Cosine similarity weight
    euclidean: 0.2, // Euclidean distance weight
    features: 0.3, // Feature-specific weight
    shape: 0.2, // Shape distribution weight
  };
}

/**
 * Rank models by multiple criteria
 */
function rankModels(results, criteria = "similarity") {
  const sortFunctions = {
    similarity: (a, b) => b.similarity - a.similarity,
    volume: (a, b) => Math.abs(a.features.volume - b.features.volume),
    surfaceArea: (a, b) =>
      Math.abs(a.features.surfaceArea - b.features.surfaceArea),
    complexity: (a, b) => b.features.faceCount - a.features.faceCount,
  };

  const sortFn = sortFunctions[criteria] || sortFunctions.similarity;
  return results.sort(sortFn);
}

module.exports = {
  findSimilar,
  computeSimilarity,
  compareFeatures,
  rankModels,
  getDefaultWeights,
};
