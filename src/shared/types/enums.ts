/**
 * Supported 3D file formats
 */
export enum ModelFormat {
  GLTF = "gltf",
  GLB = "glb",
  STEP = "step",
  STP = "stp",
  OBJ = "obj",
  STL = "stl",
}

/**
 * STEP format variants (ISO 10303)
 */
export enum StepProtocol {
  AP203 = "ap203", // Configuration controlled 3D designs
  AP214 = "ap214", // Core data for automotive
  AP242 = "ap242", // Managed model based 3D engineering
}

/**
 * Model loading states
 */
export enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

/**
 * View modes for the 3D viewer
 */
export enum ViewMode {
  NORMAL = "normal",
  WIREFRAME = "wireframe",
  SHADED = "shaded",
  TRANSPARENT = "transparent",
}

/**
 * Camera projection types
 */
export enum ProjectionType {
  PERSPECTIVE = "perspective",
  ORTHOGRAPHIC = "orthographic",
}

/**
 * Selection modes
 */
export enum SelectionMode {
  SINGLE = "single",
  MULTIPLE = "multiple",
}

/**
 * Highlight types
 */
export enum HighlightType {
  NONE = "none",
  HOVER = "hover",
  SELECTED = "selected",
  ISOLATED = "isolated",
}
