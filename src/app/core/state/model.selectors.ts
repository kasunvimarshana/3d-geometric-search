import { createSelector, createFeatureSelector } from "@ngrx/store";
import * as fromModel from "./model.reducer";

export const selectModelState = createFeatureSelector<fromModel.State>("model");

export const selectSectionTree = createSelector(
  selectModelState,
  (s) => s.sectionTree
);
export const selectFocusedNodeId = createSelector(
  selectModelState,
  (s) => s.focusedNodeId
);
export const selectModelLoading = createSelector(
  selectModelState,
  (s) => s.loading
);
export const selectModelError = createSelector(
  selectModelState,
  (s) => s.error
);
