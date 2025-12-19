import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ModelActions from "./model.actions";
import { from, of } from "rxjs";
import {
  mergeMap,
  map,
  catchError,
  takeUntil,
  withLatestFrom,
  filter,
  auditTime,
} from "rxjs/operators";
import { ThreeViewerService } from "../services/three-viewer.service";
import { Store } from "@ngrx/store";
import * as ModelSelectors from "./model.selectors";

@Injectable()
export class ModelEffects {
  readonly load$;
  readonly pick$;
  readonly progress$;
  readonly cancel$;
  readonly start$;

  constructor(
    private actions$: Actions,
    private viewer: ThreeViewerService,
    private store: Store
  ) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ModelActions.loadModel),
        mergeMap(({ files }) =>
          // Cancel the in-flight load when cancelLoad is dispatched
          // Note: Promise work may continue, but effects stop emitting.
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
            ),
            takeUntil(this.actions$.pipe(ofType(ModelActions.cancelLoad)))
          )
        )
      )
    );

    // Emit loadStart with the first file name for UI display
    this.start$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ModelActions.loadModel),
        map(({ files }) => {
          const f =
            Array.isArray(files) && files.length > 0 ? files[0] : files?.[0];
          if (f?.name) return ModelActions.loadStart({ fileName: f.name });
          return { type: "NOOP" } as any;
        })
      )
    );

    // Bridge viewer picking events into model focus
    this.pick$ = createEffect(() =>
      this.viewer.pickedObject$.pipe(
        map((id: string) => ModelActions.focusNode({ nodeId: id }))
      )
    );

    // Bridge viewer progress into model loadProgress
    this.progress$ = createEffect(() =>
      this.viewer.loadProgress$.pipe(
        withLatestFrom(this.store.select(ModelSelectors.selectModelLoading)),
        filter(([_, loading]) => !!loading),
        auditTime(50),
        map(([p]) => ModelActions.loadProgress({ progress: p as number }))
      )
    );

    // On cancelLoad, invoke viewer.cancelLoad() to abort FileReader and ignore results
    this.cancel$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ModelActions.cancelLoad),
          map(() => {
            this.viewer.cancelLoad();
            return { type: "NOOP" };
          })
        ),
      { dispatch: false }
    );
  }
}
