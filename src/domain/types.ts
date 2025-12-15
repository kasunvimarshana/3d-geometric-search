/**
 * Core domain types for the 3D geometric search application
 */

export enum FileFormat {
  GLTF = "gltf",
  GLB = "glb",
  STEP = "step",
  STP = "stp",
  OBJ = "obj",
  STL = "stl",
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  min: Vector3D;
  max: Vector3D;
}

export interface ModelProperty {
  id: string;
  name: string;
  value: string | number | boolean;
  type: "string" | "number" | "boolean" | "vector3d";
  category?: string;
}

export interface ModelSection {
  id: string;
  name: string;
  type: "assembly" | "part" | "mesh" | "group";
  parentId: string | null;
  children: string[];
  visible: boolean;
  selected: boolean;
  highlighted: boolean;
  properties: ModelProperty[];
  boundingBox?: BoundingBox;
  meshId?: string;
  materialId?: string;
}

export interface Model3D {
  id: string;
  name: string;
  format: FileFormat;
  rootSectionId: string;
  sections: Map<string, ModelSection>;
  loadedAt: Date;
  metadata: Record<string, any>;
  threeScene?: any; // THREE.Object3D - the actual loaded 3D scene
}

export interface ViewState {
  zoom: number;
  scale: number;
  rotation: Vector3D;
  position: Vector3D;
  fullscreen: boolean;
}

export interface SelectionState {
  selectedSectionIds: string[];
  focusedSectionId: string | null;
  highlightedSectionIds: string[];
}

export interface ModelState {
  model: Model3D | null;
  viewState: ViewState;
  selectionState: SelectionState;
  disassembled: boolean;
  loading: boolean;
  error: string | null;
}
