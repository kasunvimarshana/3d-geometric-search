import { createSlice, createAction } from "@reduxjs/toolkit";

export const fitToSelection = createAction("viewer/fitToSelection");
export const fitToAll = createAction("viewer/fitToAll");
export const toggleFullscreen = createAction("viewer/toggleFullscreen");
export const resetView = createAction("viewer/resetView");
export const setCanvasReady = createAction("viewer/setCanvasReady"); // payload: { ready }

const viewerSlice = createSlice({
  name: "viewer",
  initialState: {
    canvasReady: false,
    fullscreen: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleFullscreen, (state) => {
        state.fullscreen = !state.fullscreen;
      })
      .addCase(setCanvasReady, (state, action) => {
        state.canvasReady = !!action.payload.ready;
      });
  },
});

export const viewerReducer = viewerSlice.reducer;
