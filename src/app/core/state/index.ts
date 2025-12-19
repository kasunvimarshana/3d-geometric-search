import { ActionReducerMap } from "@ngrx/store";
import * as fromModel from "./model.reducer";
import * as fromViewer from "./viewer.reducer";

export interface AppState {
  model: fromModel.State;
  viewer: fromViewer.State;
}

export const reducers: ActionReducerMap<AppState> = {
  model: fromModel.reducer,
  viewer: fromViewer.reducer,
};
