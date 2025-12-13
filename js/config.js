/**
 * Configuration Management Module
 * Centralizes all application settings and constants
 */

export const Config = {
  // Viewer Settings
  viewer: {
    defaultCameraPosition: { x: 5, y: 5, z: 5 },
    cameraFov: 45,
    cameraNear: 0.1,
    cameraFar: 1000,
    backgroundColor: 0x1a1a1a,
    gridSize: 10,
    gridDivisions: 10,
    enableShadows: true,
    shadowMapSize: 2048,
    antialias: true,
    minZoomDistance: 1,
    maxZoomDistance: 100,
    defaultZoomLevel: 50,
    zoomSpeed: 0.8,
    autoRotateSpeed: 2.0,
    modelScaleMin: 0.1,
    modelScaleMax: 3.0,
    modelScaleDefault: 1.0,
    highlightColor: 0x0284c7,
    highlightIntensity: 0.3,
  },

  // Lighting Configuration
  lighting: {
    ambient: {
      color: 0xffffff,
      intensity: 0.6,
    },
    directional: {
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 5, y: 10, z: 5 },
      castShadow: true,
    },
    hemisphere: {
      skyColor: 0xffffff,
      groundColor: 0x444444,
      intensity: 0.4,
    },
    spotlight: {
      color: 0xffffff,
      intensity: 0.5,
      position: { x: 0, y: 10, z: 0 },
      castShadow: false,
    },
  },

  // Model Loading Settings
  modelLoader: {
    supportedFormats: [".gltf", ".glb", ".obj", ".stl", ".mtl"],
    thumbnailWidth: 200,
    thumbnailHeight: 150,
    defaultMaterialColor: 0x6699ff,
    defaultMaterialSpecular: 0x111111,
    defaultMaterialShininess: 200,
  },

  // Geometry Analysis Settings
  geometryAnalysis: {
    similarityWeights: {
      vertexCount: 0.15,
      faceCount: 0.15,
      volume: 0.2,
      surfaceArea: 0.15,
      compactness: 0.15,
      aspectRatio: 0.2,
    },
    maxSimilarResults: 5,
    similarityThreshold: 0, // 0-100%
  },

  // UI Settings
  ui: {
    uploadFormats: "glTF/GLB, STEP, OBJ/MTL, STL",
    maxRecentModels: 10,
    animationDuration: 300, // ms
    toastDuration: 3000, // ms
    confirmDelete: true,
  },

  // Export Settings
  export: {
    imageFormat: "png",
    imageQuality: 0.95,
    screenshotWidth: 1920,
    screenshotHeight: 1080,
    jsonIndent: 2,
  },

  // Performance Settings
  performance: {
    maxVertices: 1000000,
    decimationThreshold: 500000,
    enableAutoDecimation: false,
    renderOnDemand: false,
  },

  // Debug Settings
  debug: {
    enableLogging: true,
    showStats: false,
    showAxesHelper: false,
    showBoundingBox: false,
  },

  // Color Scheme
  colors: {
    primary: "#333333",
    secondary: "#666666",
    accent: "#0284c7",
    success: "#2d8659",
    warning: "#d97706",
    danger: "#c93a2e",
    background: "#fafafa",
    text: "#333333",
    textLight: "#666666",
  },
};

/**
 * Get configuration value by path
 * @param {string} path - Dot notation path (e.g., 'viewer.backgroundColor')
 * @returns {*} Configuration value
 */
export function getConfig(path) {
  return path.split(".").reduce((obj, key) => obj?.[key], Config);
}

/**
 * Update configuration value
 * @param {string} path - Dot notation path
 * @param {*} value - New value
 */
export function setConfig(path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => obj[key], Config);
  if (target) {
    target[lastKey] = value;
  }
}

/**
 * Validate configuration on load
 */
export function validateConfig() {
  const warnings = [];

  if (Config.performance.maxVertices < 1000) {
    warnings.push("maxVertices is very low, may affect usability");
  }

  if (Config.geometryAnalysis.maxSimilarResults < 1) {
    warnings.push("maxSimilarResults must be at least 1");
    Config.geometryAnalysis.maxSimilarResults = 1;
  }

  return warnings;
}

export default Config;
