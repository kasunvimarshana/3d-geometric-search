/**
 * Domain types and enums
 */

export enum ModelFormat {
  GLTF = "gltf",
  GLB = "glb",
  STEP = "step",
  OBJ = "obj",
  STL = "stl",
}

export enum ViewMode {
  NORMAL = "normal",
  SECTION_ISOLATED = "section_isolated",
  FULLSCREEN = "fullscreen",
}

export enum AnimationState {
  ASSEMBLED = "assembled",
  DISASSEMBLED = "disassembled",
  TRANSITIONING = "transitioning",
}

export enum EventType {
  MODEL_LOAD_START = "model_load_start",
  MODEL_LOAD_SUCCESS = "model_load_success",
  MODEL_LOAD_ERROR = "model_load_error",
  SECTION_SELECT = "section_select",
  SECTION_DESELECT = "section_deselect",
  SECTION_FOCUS = "section_focus",
  SECTION_ISOLATE = "section_isolate",
  SECTION_HIGHLIGHT = "section_highlight",
  SECTION_DEHIGHLIGHT = "section_dehighlight",
  VIEW_RESET = "view_reset",
  VIEW_ZOOM = "view_zoom",
  VIEW_SCALE = "view_scale",
  VIEW_FIT_TO_SCREEN = "view_fit_to_screen",
  VIEW_MODE_CHANGE = "view_mode_change",
  ANIMATION_START = "animation_start",
  ANIMATION_COMPLETE = "animation_complete",
  STATE_UPDATE = "state_update",
  ERROR = "error",
}

/**
 * Core domain interfaces
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  min: Vector3D;
  max: Vector3D;
}

export interface Material {
  id: string;
  name: string;
  color?: string;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  transparent?: boolean;
}

export interface Geometry {
  id: string;
  type: string;
  vertices: number[];
  indices?: number[];
  normals?: number[];
  uvs?: number[];
}

export interface ModelSection {
  id: string;
  name: string;
  parentId?: string;
  childIds: string[];
  geometryId: string;
  materialId: string;
  transform: Transform;
  boundingBox: BoundingBox;
  metadata: Record<string, unknown>;
  visible: boolean;
  selected: boolean;
  highlighted: boolean;
}

export interface Transform {
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
}

export interface Model {
  id: string;
  name: string;
  format: ModelFormat;
  sections: Map<string, ModelSection>;
  geometries: Map<string, Geometry>;
  materials: Map<string, Material>;
  rootSectionIds: string[];
  boundingBox: BoundingBox;
  metadata: Record<string, unknown>;
}

export interface CameraState {
  position: Vector3D;
  target: Vector3D;
  zoom: number;
  fieldOfView: number;
  minZoomDistance: number;
  maxZoomDistance: number;
}

export interface ViewState {
  mode: ViewMode;
  cameraState: CameraState;
  selectedSectionIds: string[];
  highlightedSectionIds: string[];
  focusedSectionId?: string;
  isolatedSectionIds: string[];
  animationState: AnimationState;
  modelScale: number;
  minModelScale: number;
  maxModelScale: number;
}

export interface ApplicationState {
  model?: Model;
  viewState: ViewState;
  loading: boolean;
  error?: string;
}
