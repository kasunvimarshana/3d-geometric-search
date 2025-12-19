import { createAction, props } from "@ngrx/store";
import { SectionNode } from "./model.types";

export const loadModel = createAction(
  "[Model] Load",
  props<{ files: File[] }>()
);
export const loadSuccess = createAction(
  "[Model] Load Success",
  props<{ tree: SectionNode[] }>()
);
export const loadFailure = createAction(
  "[Model] Load Failure",
  props<{ error: string }>()
);

export const focusNode = createAction(
  "[Model] Focus Node",
  props<{ nodeId: string }>()
);
export const refreshModel = createAction("[Model] Refresh");
