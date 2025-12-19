import { createAction, props } from "@ngrx/store";

export const resetView = createAction("[Viewer] Reset View");
export const fitToScreen = createAction("[Viewer] Fit To Screen");
export const toggleFullScreen = createAction("[Viewer] Toggle Full Screen");

export const highlightById = createAction(
  "[Viewer] Highlight By Id",
  props<{ id: string }>()
);
export const clearHighlight = createAction("[Viewer] Clear Highlight");

export const isolateById = createAction(
  "[Viewer] Isolate By Id",
  props<{ id: string }>()
);
export const clearIsolation = createAction("[Viewer] Clear Isolation");

export const fitToObject = createAction(
  "[Viewer] Fit To Object",
  props<{ id: string }>()
);
