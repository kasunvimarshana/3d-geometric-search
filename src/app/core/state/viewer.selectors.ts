import { createFeatureSelector } from "@ngrx/store";
import * as fromViewer from "./viewer.reducer";

export const selectViewerState =
  createFeatureSelector<fromViewer.State>("viewer");
