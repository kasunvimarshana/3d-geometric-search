import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import * as ViewerActions from "../../core/state/viewer.actions";
import * as ModelActions from "../../core/state/model.actions";
import * as ModelSelectors from "../../core/state/model.selectors";
import { Observable } from "rxjs";

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent {
  selectedId$: Observable<string | null>;
  private selectedId: string | null = null;

  constructor(private store: Store) {
    this.selectedId$ = this.store.select(ModelSelectors.selectFocusedNodeId);
    this.selectedId$.subscribe((id) => (this.selectedId = id));
  }

  onReset() {
    this.store.dispatch(ViewerActions.resetView());
  }
  onRefresh() {
    this.store.dispatch(ModelActions.refreshModel());
  }
  onFit() {
    this.store.dispatch(ViewerActions.fitToScreen());
  }
  onFullscreen() {
    this.store.dispatch(ViewerActions.toggleFullScreen());
  }

  onHighlightSelected() {
    if (!this.selectedId) return;
    this.store.dispatch(ViewerActions.highlightById({ id: this.selectedId }));
  }

  onClearHighlight() {
    this.store.dispatch(ViewerActions.clearHighlight());
  }

  onIsolateSelected() {
    if (!this.selectedId) return;
    this.store.dispatch(ViewerActions.isolateById({ id: this.selectedId }));
  }

  onClearIsolation() {
    this.store.dispatch(ViewerActions.clearIsolation());
  }

  onFitSelected() {
    if (!this.selectedId) return;
    this.store.dispatch(ViewerActions.fitToObject({ id: this.selectedId }));
  }

  onFile(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    // Dispatch load action for the first file (extend to multiple later)
    this.store.dispatch(ModelActions.loadModel({ files: Array.from(files) }));
    input.value = "";
  }
}
