import { createSlice, createAction } from "@reduxjs/toolkit";

function loadSavedCamera() {
  try {
    const raw = localStorage.getItem("viewer.camera.v1");
    if (!raw) return null;
    const cam = JSON.parse(raw);
    if (cam && Array.isArray(cam.position) && Array.isArray(cam.target))
      return cam;
  } catch {}
  return null;
}

export const fitToSelection = createAction("viewer/fitToSelection");
export const fitToAll = createAction("viewer/fitToAll");
export const toggleFullscreen = createAction("viewer/toggleFullscreen");
export const resetView = createAction("viewer/resetView");
export const setCanvasReady = createAction("viewer/setCanvasReady"); // payload: { ready }
export const setCamera = createAction("viewer/setCamera"); // payload: { position:[x,y,z], target:[x,y,z] }
export const clearCamera = createAction("viewer/clearCamera");

const viewerSlice = createSlice({
  name: "viewer",
  initialState: {
    canvasReady: false,
    fullscreen: false,
    camera: loadSavedCamera(),
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleFullscreen, (state) => {
        state.fullscreen = !state.fullscreen;
      })
      .addCase(setCanvasReady, (state, action) => {
        state.canvasReady = !!action.payload.ready;
      })
      .addCase(setCamera, (state, action) => {
        state.camera = {
          position: Array.isArray(action.payload?.position)
            ? action.payload.position
            : state.camera?.position,
          target: Array.isArray(action.payload?.target)
            ? action.payload.target
            : state.camera?.target,
        };
      })
      .addCase(clearCamera, (state) => {
        state.camera = null;
      });
  },
});

export const viewerReducer = viewerSlice.reducer;
