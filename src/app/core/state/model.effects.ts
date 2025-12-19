import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ModelActions from "./model.actions";
import { from, of } from "rxjs";
import { mergeMap, map, catchError } from "rxjs/operators";
import { ThreeViewerService } from "../services/three-viewer.service";

@Injectable()
export class ModelEffects {
  readonly load$;
  readonly pick$;

  constructor(private actions$: Actions, private viewer: ThreeViewerService) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ModelActions.loadModel),
        mergeMap(({ files }) =>
          from(
            Array.isArray(files) && files.length > 1
              ? this.viewer.loadFiles(files)
              : this.viewer.loadFile(files?.[0])
          ).pipe(
            map(() =>
              ModelActions.loadSuccess({
                tree: this.viewer.buildSectionTree(),
              })
            ),
            catchError((e: any) =>
              of(
                ModelActions.loadFailure({
                  error: e?.message ?? "Load failed",
                })
              )
            )
          )
        )
      )
    );

    // Bridge viewer picking events into model focus
    this.pick$ = createEffect(() =>
      this.viewer.pickedObject$.pipe(
        map((id: string) => ModelActions.focusNode({ nodeId: id }))
      )
    );
  }
}
