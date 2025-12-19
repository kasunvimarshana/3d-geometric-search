import { createReducer, on } from "@ngrx/store";
import * as ModelActions from "./model.actions";
import { SectionNode } from "./model.types";

export interface State {
  sectionTree: SectionNode[];
  focusedNodeId: string | null;
  loading: boolean;
  error?: string;
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
  })),
  on(ModelActions.loadSuccess, (state, { tree }) => ({
    ...state,
    loading: false,
    sectionTree: tree,
  })),
  on(ModelActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(ModelActions.clearError, (state) => ({
    ...state,
    error: undefined,
  })),
  on(ModelActions.focusNode, (state, { nodeId }) => ({
    ...state,
    focusedNodeId: nodeId,
  }))
);
