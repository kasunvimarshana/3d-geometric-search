import { createReducer, on } from "@ngrx/store";
import * as ModelActions from "./model.actions";
import { SectionNode } from "./model.types";

export interface State {
  sectionTree: SectionNode[];
  focusedNodeId: string | null;
  loading: boolean;
  error?: string;
  progress?: number;
  loadingFileName?: string;
  lastLoadedFileName?: string;
}

const initialState: State = {
  sectionTree: [],
  focusedNodeId: null,
  loading: false,
};

export const reducer = createReducer(
  initialState,
  on(ModelActions.loadModel, (state) => ({
    ...state,
    loading: true,
    error: undefined,
    progress: 0,
    loadingFileName: undefined,
  })),
  on(ModelActions.loadSuccess, (state, { tree }) => ({
    ...state,
    loading: false,
    sectionTree: tree,
    progress: undefined,
    loadingFileName: undefined,
    // Keep lastLoadedFileName for naming exports
    lastLoadedFileName: state.lastLoadedFileName,
  })),
  on(ModelActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    progress: undefined,
    loadingFileName: undefined,
  })),
  on(ModelActions.clearError, (state) => ({
    ...state,
    error: undefined,
  })),
  on(ModelActions.loadProgress, (state, { progress }) => ({
    ...state,
    progress,
  })),
  on(ModelActions.cancelLoad, (state) => ({
    ...state,
    loading: false,
    progress: undefined,
    loadingFileName: undefined,
  })),
  on(ModelActions.loadStart, (state, { fileName }) => ({
    ...state,
    loadingFileName: fileName,
    lastLoadedFileName: fileName,
  })),
  on(ModelActions.focusNode, (state, { nodeId }) => ({
    ...state,
    focusedNodeId: nodeId,
  }))
);
