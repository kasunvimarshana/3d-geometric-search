import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ViewerActions from "./viewer.actions";
import * as ModelActions from "./model.actions";
import { tap } from "rxjs/operators";
import { ThreeViewerService } from "../services/three-viewer.service";
import { map, mergeMap } from "rxjs/operators";
import { of } from "rxjs";

@Injectable()
export class ViewerEffects {
  readonly reset$;
  readonly fit$;
  readonly full$;
  readonly highlight$;
  readonly clearHighlight$;
  readonly isolate$;
  readonly clearIsolation$;
  readonly fitObject$;
  readonly focusHighlightFit$;

  constructor(private actions$: Actions, private viewer: ThreeViewerService) {
    this.reset$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.resetView),
          tap(() => this.viewer.resetView())
        ),
      { dispatch: false }
    );

    this.fit$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.fitToScreen),
          tap(() => this.viewer.fitToScreen())
        ),
      { dispatch: false }
    );

    this.full$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.toggleFullScreen),
          tap(() => this.viewer.setFullScreen())
        ),
      { dispatch: false }
    );

    this.highlight$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.highlightById),
          tap(({ id }) => this.viewer.highlightById(id))
        ),
      { dispatch: false }
    );

    this.clearHighlight$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.clearHighlight),
          tap(() => this.viewer.clearHighlight())
        ),
      { dispatch: false }
    );

    this.isolate$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.isolateById),
          tap(({ id }) => this.viewer.isolateById(id))
        ),
      { dispatch: false }
    );

    this.clearIsolation$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.clearIsolation),
          tap(() => this.viewer.clearIsolation())
        ),
      { dispatch: false }
    );

    this.fitObject$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ViewerActions.fitToObject),
          tap(({ id }) => this.viewer.fitToObject(id))
        ),
      { dispatch: false }
    );

    // When user picks an object in the viewer, clear highlight then highlight and fit it
    createEffect(() =>
      this.viewer.pickedObject$.pipe(
        mergeMap((id: string) =>
          of(
            ViewerActions.clearHighlight(),
            ViewerActions.highlightById({ id }),
            ViewerActions.fitToObject({ id })
          )
        )
      )
    );

    // When focus changes from the tree, highlight and fit
    this.focusHighlightFit$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ModelActions.focusNode),
        mergeMap(({ nodeId }) =>
          of(
            ViewerActions.clearHighlight(),
            ViewerActions.highlightById({ id: nodeId }),
            ViewerActions.fitToObject({ id: nodeId })
          )
        )
      )
    );
  }
}
