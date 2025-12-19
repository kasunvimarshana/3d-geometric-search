import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ModelActions from "./model.actions";
import { from, of } from "rxjs";
import { mergeMap, map, catchError } from "rxjs/operators";
import { ThreeViewerService } from "../services/three-viewer.service";

@Injectable()
export class ModelEffects {
  readonly load$;

  constructor(private actions$: Actions, private viewer: ThreeViewerService) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ModelActions.loadModel),
        mergeMap(({ files }) =>
          from(this.viewer.loadFile(files?.[0])).pipe(
            map(() =>
              ModelActions.loadSuccess({
                tree: [{ id: "root", name: files?.[0]?.name ?? "model", children: [] }],
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
  }
}
