import { EMPTY, of } from "rxjs";
import { concatMap } from "rxjs/operators";
import { isAnyOf } from "@reduxjs/toolkit";
import {
  fitToSelection,
  fitToAll,
  toggleFullscreen,
  resetView,
} from "../slices/viewerSlice.js";
import { ModelRegistry } from "../../core/registry/ModelRegistry.js";
import { fitToObject } from "../../core/services/fitView.js";

const fitEpic = (action$) =>
  action$.pipe(
    isAnyOf(fitToSelection, fitToAll),
    concatMap((action) => {
      const root = ModelRegistry.getRoot();
      if (!root) return EMPTY;
      if (action.type === fitToSelection.type) {
        const target = ModelRegistry.getSelectionOrRoot();
        fitToObject(target);
      } else {
        fitToObject(root);
      }
      return EMPTY;
    })
  );

const fullscreenEpic = (action$) =>
  action$.pipe(
    isAnyOf(toggleFullscreen),
    concatMap(() => {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        elem.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      return EMPTY;
    })
  );

const resetEpic = (action$) =>
  action$.pipe(
    isAnyOf(resetView),
    concatMap(() => {
      ModelRegistry.resetTransforms();
      const root = ModelRegistry.getRoot();
      if (root) fitToObject(root);
      return of();
    })
  );

export const viewerEpics = [fitEpic, fullscreenEpic, resetEpic];
