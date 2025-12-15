import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { Model } from "@core/entities/Model";
import {
  UUID,
  ErrorInfo,
  LoadingProgress,
  CameraState,
} from "@shared/types/interfaces";
import { LoadingState, ViewMode, ProjectionType } from "@shared/types/enums";
import { VIEWER_CONFIG } from "@shared/constants";

// Enable Immer's MapSet plugin to support Map and Set
enableMapSet();

/**
 * Application state interface
 */
interface AppState {
  // Model state
  currentModel: Model | null;
  loadingState: LoadingState;
  loadingProgress: LoadingProgress | null;
  error: ErrorInfo | null;

  // Selection state
  selectedIds: Set<UUID>;
  hoveredId: UUID | null;
  isolatedIds: Set<UUID> | null;

  // Viewer state
  viewMode: ViewMode;
  camera: CameraState;
  isFullScreen: boolean;
  showGrid: boolean;
  showAxes: boolean;

  // Actions
  setModel: (model: Model | null) => void;
  setLoadingState: (state: LoadingState) => void;
  setLoadingProgress: (progress: LoadingProgress | null) => void;
  setError: (error: ErrorInfo | null) => void;

  // Selection actions
  selectSections: (ids: UUID[], clearPrevious?: boolean) => void;
  deselectSections: (ids: UUID[]) => void;
  clearSelection: () => void;
  setHoveredId: (id: UUID | null) => void;
  isolateSections: (ids: UUID[]) => void;
  clearIsolation: () => void;

  // Viewer actions
  setViewMode: (mode: ViewMode) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setFullScreen: (isFullScreen: boolean) => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  resetViewer: () => void;
}

/**
 * Create the application store
 * Follows centralized state management pattern
 */
export const useAppStore = create<AppState>()(
  immer((set) => ({
    // Initial state
    currentModel: null,
    loadingState: LoadingState.IDLE,
    loadingProgress: null,
    error: null,

    selectedIds: new Set(),
    hoveredId: null,
    isolatedIds: null,

    viewMode: ViewMode.SHADED,
    camera: {
      position: { x: 50, y: 50, z: 50 },
      target: { x: 0, y: 0, z: 0 },
      zoom: VIEWER_CONFIG.DEFAULT_ZOOM,
      projectionType: ProjectionType.PERSPECTIVE,
      fov: VIEWER_CONFIG.DEFAULT_FOV,
    },
    isFullScreen: false,
    showGrid: true,
    showAxes: true,

    // Model actions
    setModel: (model) =>
      set((state) => {
        state.currentModel = model;
        state.error = null;
        state.selectedIds.clear();
        state.hoveredId = null;
        state.isolatedIds = null;
      }),

    setLoadingState: (loadingState) =>
      set((state) => {
        state.loadingState = loadingState;
      }),

    setLoadingProgress: (progress) =>
      set((state) => {
        state.loadingProgress = progress;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.loadingState = LoadingState.ERROR;
      }),

    // Selection actions
    selectSections: (ids, clearPrevious = true) =>
      set((state) => {
        if (clearPrevious) {
          state.selectedIds.clear();
        }
        ids.forEach((id) => state.selectedIds.add(id));
      }),

    deselectSections: (ids) =>
      set((state) => {
        ids.forEach((id) => state.selectedIds.delete(id));
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedIds.clear();
      }),

    setHoveredId: (id) =>
      set((state) => {
        state.hoveredId = id;
      }),

    isolateSections: (ids) =>
      set((state) => {
        state.isolatedIds = new Set(ids);
      }),

    clearIsolation: () =>
      set((state) => {
        state.isolatedIds = null;
      }),

    // Viewer actions
    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),

    setCamera: (camera) =>
      set((state) => {
        state.camera = { ...state.camera, ...camera };
      }),

    setFullScreen: (isFullScreen) =>
      set((state) => {
        state.isFullScreen = isFullScreen;
      }),

    toggleGrid: () =>
      set((state) => {
        state.showGrid = !state.showGrid;
      }),

    toggleAxes: () =>
      set((state) => {
        state.showAxes = !state.showAxes;
      }),

    resetViewer: () =>
      set((state) => {
        state.viewMode = ViewMode.SHADED;
        state.camera = {
          position: { x: 50, y: 50, z: 50 },
          target: { x: 0, y: 0, z: 0 },
          zoom: VIEWER_CONFIG.DEFAULT_ZOOM,
          projectionType: ProjectionType.PERSPECTIVE,
          fov: VIEWER_CONFIG.DEFAULT_FOV,
        };
        state.isFullScreen = false;
        state.showGrid = true;
        state.showAxes = true;
      }),
  }))
);

/**
 * Selectors for derived state
 */
export const selectIsLoading = (state: AppState) =>
  state.loadingState === LoadingState.LOADING;

export const selectHasModel = (state: AppState) => state.currentModel !== null;

export const selectHasError = (state: AppState) => state.error !== null;

export const selectSelectedCount = (state: AppState) => state.selectedIds.size;

export const selectIsIsolated = (state: AppState) => state.isolatedIds !== null;
