import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import {
  modelReducer,
  loadModelRequested,
  modelLoaded,
  loadFailed,
  selectNode,
  isolateSection,
  clearIsolation,
  highlightNodes,
  clearHighlights,
  disassemble,
  reassemble,
  refreshScene,
} from "./slices/modelSlice.js";
import {
  viewerReducer,
  fitToSelection,
  fitToAll,
  toggleFullscreen,
  resetView,
  setCamera,
} from "./slices/viewerSlice.js";
import { uiReducer } from "./slices/uiSlice.js";
import { ModelRegistry } from "../core/registry/ModelRegistry.js";
import { buildModelTree } from "../core/domain/modelTree.js";
import {
  loadAnyModel,
  loadAnyModelFromFiles,
} from "../infrastructure/loaders/index.js";
import { fitToObject } from "../core/services/fitView.js";

const listenerMiddleware = createListenerMiddleware();

// Load model
listenerMiddleware.startListening({
  actionCreator: loadModelRequested,
  effect: async (action, api) => {
    try {
      const { file, files } = action.payload || {};
      const result =
        files && files.length
          ? await loadAnyModelFromFiles(files)
          : await loadAnyModel(file);
      const { modelId, rootObject } = result;
      ModelRegistry.register(modelId, rootObject);
      const tree = buildModelTree(rootObject);
      api.dispatch(modelLoaded({ modelId, tree }));
      // Always trigger a fit after load to ensure the model is visible
      api.dispatch(fitToAll());
    } catch (err) {
      api.dispatch(loadFailed({ error: String(err?.message || err) }));
    }
  },
});

// Selection
listenerMiddleware.startListening({
  actionCreator: selectNode,
  effect: async (action, api) => {
    const { nodeId } = action.payload;
    ModelRegistry.select(nodeId);
    api.dispatch(fitToSelection());
  },
});

// Isolation
listenerMiddleware.startListening({
  matcher: isAnyOf(isolateSection, clearIsolation),
  effect: async (action, api) => {
    if (action.type === isolateSection.type) {
      ModelRegistry.isolate(action.payload.nodeId);
      api.dispatch(fitToSelection());
    } else {
      ModelRegistry.clearIsolation();
      api.dispatch(fitToAll());
    }
  },
});

// Highlighting
listenerMiddleware.startListening({
  matcher: isAnyOf(highlightNodes, clearHighlights),
  effect: async (action) => {
    if (action.type === highlightNodes.type) {
      ModelRegistry.highlight(action.payload.nodeIds);
    } else {
      ModelRegistry.highlight([]);
    }
  },
});

// Disassemble / Reassemble
listenerMiddleware.startListening({
  matcher: isAnyOf(disassemble, reassemble),
  effect: async (action) => {
    if (action.type === disassemble.type) {
      await ModelRegistry.disassemble(action.payload?.factor ?? 1);
    } else {
      await ModelRegistry.reassemble();
    }
  },
});

// Refresh materials
listenerMiddleware.startListening({
  actionCreator: refreshScene,
  effect: () => {
    ModelRegistry.refreshMaterials();
  },
});

// Fit view
listenerMiddleware.startListening({
  matcher: isAnyOf(fitToSelection, fitToAll),
  effect: (action) => {
    const root = ModelRegistry.getRoot();
    if (!root) return;
    const target =
      action.type === fitToSelection.type
        ? ModelRegistry.getSelectionOrRoot()
        : root;
    fitToObject(target);
  },
});

// Fullscreen toggle
listenerMiddleware.startListening({
  actionCreator: toggleFullscreen,
  effect: () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) elem.requestFullscreen?.();
    else document.exitFullscreen?.();
  },
});

// Reset view
listenerMiddleware.startListening({
  actionCreator: resetView,
  effect: () => {
    ModelRegistry.resetTransforms();
    const root = ModelRegistry.getRoot();
    if (root) fitToObject(root);
  },
});

export const store = configureStore({
  reducer: {
    model: modelReducer,
    viewer: viewerReducer,
    ui: uiReducer,
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }).concat(
      listenerMiddleware.middleware
    ),
});

// Persist camera updates to localStorage
listenerMiddleware.startListening({
  actionCreator: setCamera,
  effect: (action) => {
    try {
      const data = JSON.stringify({
        position: action.payload?.position,
        target: action.payload?.target,
      });
      localStorage.setItem("viewer.camera.v1", data);
    } catch {}
  },
});
