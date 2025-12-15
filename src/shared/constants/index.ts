/**
 * Application-wide constants
 */

export const APP_CONFIG = {
  NAME: "3D Geometric Search",
  VERSION: "1.0.0",
  DESCRIPTION: "Modern reactive 3D geometric search application",
} as const;

/**
 * Viewer configuration
 */
export const VIEWER_CONFIG = {
  DEFAULT_FOV: 50,
  MIN_FOV: 10,
  MAX_FOV: 120,
  NEAR_PLANE: 0.1,
  FAR_PLANE: 10000,
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 10,
  CAMERA_DAMPING: 0.05,
  AUTO_ROTATE_SPEED: 2.0,
} as const;

/**
 * Visual styling constants
 */
export const VISUAL_CONFIG = {
  GRID_SIZE: 100,
  GRID_DIVISIONS: 100,
  AXES_SIZE: 50,
  DEFAULT_BACKGROUND: { r: 0.95, g: 0.95, b: 0.95 },
  SELECTION_COLOR: { r: 0, g: 0.5, b: 1, a: 1 },
  HOVER_COLOR: { r: 1, g: 0.7, b: 0, a: 0.5 },
  ISOLATED_COLOR: { r: 0.8, g: 0.8, b: 0.8, a: 0.3 },
  HIGHLIGHT_INTENSITY: 0.3,
} as const;

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  CAMERA_TRANSITION: 600,
  HIGHLIGHT_FADE: 200,
} as const;

/**
 * File size limits (bytes)
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  WARN_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Supported file extensions
 */
export const SUPPORTED_EXTENSIONS = {
  GLTF: [".gltf", ".glb"],
  STEP: [".step", ".stp"],
  OBJ: [".obj"],
  STL: [".stl"],
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  FILE_NOT_FOUND: "ERR_FILE_NOT_FOUND",
  FILE_TOO_LARGE: "ERR_FILE_TOO_LARGE",
  UNSUPPORTED_FORMAT: "ERR_UNSUPPORTED_FORMAT",
  LOADING_FAILED: "ERR_LOADING_FAILED",
  PARSING_FAILED: "ERR_PARSING_FAILED",
  RENDERING_FAILED: "ERR_RENDERING_FAILED",
  INVALID_MODEL_DATA: "ERR_INVALID_MODEL_DATA",
  NETWORK_ERROR: "ERR_NETWORK_ERROR",
} as const;

/**
 * Event names
 */
export const EVENT_NAMES = {
  MODEL_LOADED: "model:loaded",
  MODEL_UNLOADED: "model:unloaded",
  SELECTION_CHANGED: "selection:changed",
  VISIBILITY_CHANGED: "visibility:changed",
  CAMERA_MOVED: "camera:moved",
  VIEWER_RESET: "viewer:reset",
  ERROR_OCCURRED: "error:occurred",
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  VIEWER_PREFERENCES: "viewer_preferences",
  RECENT_FILES: "recent_files",
  UI_STATE: "ui_state",
} as const;
