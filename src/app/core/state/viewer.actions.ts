import { createAction } from "@ngrx/store";

export const resetView = createAction("[Viewer] Reset View");
export const fitToScreen = createAction("[Viewer] Fit To Screen");
export const toggleFullScreen = createAction("[Viewer] Toggle Full Screen");
