import { createSlice, createAction } from "@reduxjs/toolkit";

// Actions
export const loadModelRequested = createAction("model/loadModelRequested"); // payload: {file}
export const modelLoaded = createAction("model/modelLoaded"); // payload: { modelId, tree }
export const loadFailed = createAction("model/loadFailed"); // payload: { error }
export const selectNode = createAction("model/selectNode"); // payload: { nodeId }
export const isolateSection = createAction("model/isolateSection"); // payload: { nodeId }
export const clearIsolation = createAction("model/clearIsolation");
export const highlightNodes = createAction("model/highlightNodes"); // payload: { nodeIds }
export const clearHighlights = createAction("model/clearHighlights");
export const disassemble = createAction("model/disassemble"); // payload: { factor }
export const reassemble = createAction("model/reassemble");
export const refreshScene = createAction("model/refreshScene");
export const clearError = createAction("model/clearError");

const modelSlice = createSlice({
  name: "model",
  initialState: {
    modelId: null,
    tree: null, // { id, name, children: [] }
    selectedNodeId: null,
    isolatedNodeId: null,
    highlighted: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadModelRequested, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(modelLoaded, (state, action) => {
        state.status = "ready";
        state.modelId = action.payload.modelId;
        state.tree = action.payload.tree;
      })
      .addCase(loadFailed, (state, action) => {
        state.status = "error";
        state.error = action.payload?.error || "Load failed";
      })
      .addCase(clearError, (state) => {
        state.status = state.modelId ? "ready" : "idle";
        state.error = null;
      })
      .addCase(selectNode, (state, action) => {
        state.selectedNodeId = action.payload.nodeId;
      })
      .addCase(isolateSection, (state, action) => {
        state.isolatedNodeId = action.payload.nodeId;
      })
      .addCase(clearIsolation, (state) => {
        state.isolatedNodeId = null;
      })
      .addCase(highlightNodes, (state, action) => {
        state.highlighted = action.payload.nodeIds || [];
      })
      .addCase(clearHighlights, (state) => {
        state.highlighted = [];
      });
  },
});

export const modelReducer = modelSlice.reducer;
