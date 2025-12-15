import { ModelFormat, LoadingState, ViewMode, ProjectionType } from "./enums";
import { Quaternion } from "three";

/**
 * Unique identifier type
 */
export type UUID = string;

/**
 * 3D position vector
 */
export interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * RGB color
 */
export interface Color {
  r: number;
  g: number;
  b: number;
}

/**
 * RGBA color with alpha
 */
export interface ColorWithAlpha extends Color {
  a: number;
}

/**
 * Bounding box
 */
export interface BoundingBox {
  min: Position;
  max: Position;
  center: Position;
  size: Position;
}

/**
 * Transform matrix data
 */
export interface Transform {
  position: Position;
  rotation: Quaternion;
  scale: Position;
}

/**
 * Model metadata
 */
export interface ModelMetadata {
  id: UUID;
  name: string;
  format: ModelFormat;
  fileSize: number;
  createdAt: Date;
  modifiedAt?: Date;
  author?: string;
  description?: string;
  tags?: string[];
  properties?: Record<string, unknown>;
}

/**
 * Material properties
 */
export interface MaterialProperties {
  id: UUID;
  name?: string;
  color?: ColorWithAlpha;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  emissive?: Color;
  textureUrl?: string;
}

/**
 * Geometry properties
 */
export interface GeometryProperties {
  id: UUID;
  type: "mesh" | "line" | "points";
  vertexCount: number;
  faceCount?: number;
  boundingBox: BoundingBox;
}

/**
 * Section node in hierarchical structure
 */
export interface SectionNode {
  id: UUID;
  name: string;
  parentId?: UUID;
  children: UUID[];
  geometryIds: UUID[];
  transform?: Transform;
  visible: boolean;
  selectable: boolean;
  properties?: Record<string, unknown>;
  metadata?: {
    partNumber?: string;
    material?: string;
    mass?: number;
    volume?: number;
  };
}

/**
 * Model data structure
 */
export interface ModelData {
  metadata: ModelMetadata;
  sections: Map<UUID, SectionNode>;
  geometries: Map<UUID, GeometryProperties>;
  materials: Map<UUID, MaterialProperties>;
  rootSectionIds: UUID[];
  boundingBox: BoundingBox;
}

/**
 * Loading progress
 */
export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
  message?: string;
}

/**
 * Error information
 */
export interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

/**
 * Camera state
 */
export interface CameraState {
  position: Position;
  target: Position;
  zoom: number;
  projectionType: ProjectionType;
  fov?: number;
}

/**
 * Viewer state
 */
export interface ViewerState {
  viewMode: ViewMode;
  camera: CameraState;
  isFullScreen: boolean;
  showGrid: boolean;
  showAxes: boolean;
  backgroundColor: Color;
}

/**
 * Selection state
 */
export interface SelectionState {
  selectedIds: Set<UUID>;
  hoveredId?: UUID;
  isolatedIds?: Set<UUID>;
}

/**
 * Application state
 */
export interface ApplicationState {
  currentModel?: ModelData;
  loadingState: LoadingState;
  loadingProgress?: LoadingProgress;
  error?: ErrorInfo;
  viewer: ViewerState;
  selection: SelectionState;
}

/**
 * Event payload base
 */
export interface EventPayload {
  timestamp: Date;
}

/**
 * Model loaded event
 */
export interface ModelLoadedEvent extends EventPayload {
  modelId: UUID;
  metadata: ModelMetadata;
}

/**
 * Selection changed event
 */
export interface SelectionChangedEvent extends EventPayload {
  selectedIds: UUID[];
  previousIds: UUID[];
}

/**
 * Section visibility changed event
 */
export interface VisibilityChangedEvent extends EventPayload {
  sectionId: UUID;
  visible: boolean;
}

/**
 * Camera moved event
 */
export interface CameraMovedEvent extends EventPayload {
  camera: CameraState;
}
