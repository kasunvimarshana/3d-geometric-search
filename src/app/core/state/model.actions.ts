import { createAction, props } from "@ngrx/store";
import { SectionNode } from "./model.types";

export const loadModel = createAction(
  "[Model] Load",
  props<{ files: File[] }>()
);
export const loadStart = createAction(
  "[Model] Load Start",
  props<{ fileName: string }>()
);
export const loadSuccess = createAction(
  "[Model] Load Success",
  props<{ tree: SectionNode[] }>()
);
export const loadFailure = createAction(
  "[Model] Load Failure",
  props<{ error: string }>()
);

export const clearError = createAction("[Model] Clear Error");

export const loadProgress = createAction(
  "[Model] Load Progress",
  props<{ progress: number }>()
);

export const cancelLoad = createAction("[Model] Cancel Load");

export const focusNode = createAction(
  "[Model] Focus Node",
  props<{ nodeId: string }>()
);
export const refreshModel = createAction("[Model] Refresh");
