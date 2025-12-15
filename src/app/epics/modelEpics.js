import { from, of, EMPTY } from "rxjs";
import { catchError, concatMap, map } from "rxjs/operators";
import { isAnyOf } from "@reduxjs/toolkit";
import {
  loadModelRequested,
  modelLoaded,
  loadFailed,
  selectNode,
  isolateSection,
  clearIsolation,
  highlightNodes,
  clearHighlights,
  disassemble,
  reassemble,
  refreshScene,
} from "../slices/modelSlice.js";
import { fitToSelection, fitToAll } from "../slices/viewerSlice.js";
import { ModelRegistry } from "../../core/registry/ModelRegistry.js";
import { buildModelTree } from "../../core/domain/modelTree.js";
import { loadAnyModel } from "../../infrastructure/loaders/index.js";

const loadModelEpic = (action$) =>
  action$.pipe(
    isAnyOf(loadModelRequested),
    concatMap(({ payload }) =>
      from(loadAnyModel(payload.file)).pipe(
        map(({ modelId, rootObject }) => {
          ModelRegistry.register(modelId, rootObject);
          const tree = buildModelTree(rootObject);
          return modelLoaded({ modelId, tree });
        }),
        catchError((err) =>
          of(loadFailed({ error: String(err?.message || err) }))
        )
      )
    )
  );

const autoFitOnLoadedEpic = (action$) =>
  action$.pipe(
    isAnyOf(modelLoaded),
    concatMap(() => {
      // After the model is registered and tree built, fit the whole scene
      return of(fitToAll());
    })
  );

const selectionEpic = (action$) =>
  action$.pipe(
    isAnyOf(selectNode),
    concatMap(({ payload }) => {
      const { nodeId } = payload;
      ModelRegistry.highlight([nodeId]);
      return of(fitToSelection());
    })
  );

const isolationEpic = (action$) =>
  action$.pipe(
    isAnyOf(isolateSection, clearIsolation),
    concatMap((action) => {
      if (action.type === isolateSection.type) {
        ModelRegistry.isolate(action.payload.nodeId);
        return of(fitToSelection());
      } else {
        ModelRegistry.clearIsolation();
        return of(fitToAll());
      }
    })
  );

const highlightEpic = (action$) =>
  action$.pipe(
    isAnyOf(highlightNodes, clearHighlights),
    concatMap((action) => {
      if (action.type === highlightNodes.type) {
        ModelRegistry.highlight(action.payload.nodeIds);
      } else {
        ModelRegistry.highlight([]);
      }
      return EMPTY;
    })
  );

const assembleEpic = (action$) =>
  action$.pipe(
    isAnyOf(disassemble, reassemble),
    concatMap((action) => {
      if (action.type === disassemble.type) {
        return from(
          ModelRegistry.disassemble(action.payload?.factor ?? 1)
        ).pipe(catchError(() => EMPTY));
      }
      return from(ModelRegistry.reassemble()).pipe(catchError(() => EMPTY));
    })
  );

const refreshEpic = (action$) =>
  action$.pipe(
    isAnyOf(refreshScene),
    concatMap(() => {
      ModelRegistry.refreshMaterials();
      return EMPTY;
    })
  );

export const modelEpics = [
  loadModelEpic,
  autoFitOnLoadedEpic,
  selectionEpic,
  isolationEpic,
  highlightEpic,
  assembleEpic,
  refreshEpic,
];
