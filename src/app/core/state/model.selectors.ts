import { createSelector, createFeatureSelector } from "@ngrx/store";
import * as fromModel from "./model.reducer";
import { SectionNode } from "./model.types";

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

export const selectFocusedPath = createSelector(
  selectSectionTree,
  selectFocusedNodeId,
  (tree: SectionNode[], id: string | null): SectionNode[] => {
    if (!id || !tree || tree.length === 0) return [];
    const path: SectionNode[] = [];
    const dfs = (nodes: SectionNode[], target: string): boolean => {
      for (const n of nodes) {
        path.push(n);
        if (n.id === target) return true;
        if (n.children && dfs(n.children, target)) return true;
        path.pop();
      }
      return false;
    };
    dfs(tree, id);
    return path;
  }
);
