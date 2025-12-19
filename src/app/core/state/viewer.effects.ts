import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ViewerActions from "./viewer.actions";
import { tap } from "rxjs/operators";
import { ThreeViewerService } from "../services/three-viewer.service";

@Injectable()
export class ViewerEffects {
  readonly reset$;
  readonly fit$;
  readonly full$;

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
  }
}
