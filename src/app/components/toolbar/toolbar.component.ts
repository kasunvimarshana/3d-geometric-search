import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import * as ViewerActions from "../../core/state/viewer.actions";
import * as ModelActions from "../../core/state/model.actions";

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
})
export class ToolbarComponent {
  constructor(private store: Store) {}

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

  onFile(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    // Dispatch load action for the first file (extend to multiple later)
    this.store.dispatch(ModelActions.loadModel({ files: Array.from(files) }));
    input.value = "";
  }
}
