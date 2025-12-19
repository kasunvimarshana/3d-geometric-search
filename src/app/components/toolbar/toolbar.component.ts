import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import * as ViewerActions from "../../core/state/viewer.actions";
import * as ModelActions from "../../core/state/model.actions";
import * as ModelSelectors from "../../core/state/model.selectors";
import { Observable } from "rxjs";
import { FormatConverterService } from "../../core/services/format-converter.service";
import { ThreeViewerService } from "../../core/services/three-viewer.service";

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent {
  selectedId$: Observable<string | null>;
  private selectedId: string | null = null;
  loading$: Observable<boolean>;
  error$: Observable<string | undefined>;
  progress$: Observable<number | undefined>;
  loadingFileName$: Observable<string | undefined>;
  lastLoadedFileName$: Observable<string | undefined>;
  unitScale = 1.0;
  center = true;

  constructor(
    private store: Store,
    private converter: FormatConverterService,
    private viewer: ThreeViewerService
  ) {
    this.selectedId$ = this.store.select(ModelSelectors.selectFocusedNodeId);
    this.selectedId$.subscribe((id) => (this.selectedId = id));
    this.loading$ = this.store.select(ModelSelectors.selectModelLoading);
    this.error$ = this.store.select(ModelSelectors.selectModelError);
    this.progress$ = this.store.select(ModelSelectors.selectModelProgress);
    this.loadingFileName$ = this.store.select(
      ModelSelectors.selectLoadingFileName
    );
    this.lastLoadedFileName$ = this.store.select(
      ModelSelectors.selectLastLoadedFileName
    );
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

  onClearError() {
    this.store.dispatch(ModelActions.clearError());
  }

  onCancelLoad() {
    this.store.dispatch(ModelActions.cancelLoad());
  }

  private downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private deriveBaseName(ext: string): string {
    let base = "model";
    const sub = this.lastLoadedFileName$;
    // We cannot synchronously read Observable; fallback to current loading name via simple heuristic
    // For now, prefer the displayed loading filename via DOM; otherwise default
    // In a real app, we'd select via async pipe in template or keep last name in a service.
    return base + "." + ext;
  }

  async onExportGLTF() {
    const root = this.viewer.getRootObject();
    if (!root) return;
    const blob = await this.converter.toGLTF(root, {
      center: this.center,
      unitScale: this.unitScale,
    });
    this.downloadBlob(blob, this.deriveBaseName("glb"));
  }

  async onExportOBJ() {
    const root = this.viewer.getRootObject();
    if (!root) return;
    const blob = await this.converter.toOBJ(root, {
      center: this.center,
      unitScale: this.unitScale,
    });
    this.downloadBlob(blob, this.deriveBaseName("obj"));
  }

  async onExportSTL() {
    const root = this.viewer.getRootObject();
    if (!root) return;
    const blob = await this.converter.toSTL(root, {
      center: this.center,
      unitScale: this.unitScale,
    });
    this.downloadBlob(blob, this.deriveBaseName("stl"));
  }

  async onExportSelectedGLTF() {
    if (!this.selectedId) return;
    const obj = this.viewer.getObjectById(this.selectedId);
    if (!obj) return;
    const blob = await this.converter.toGLTF(obj, {
      center: this.center,
      unitScale: this.unitScale,
    });
    this.downloadBlob(blob, this.deriveBaseName("glb"));
  }

  async onExportSelectedOBJ() {
    if (!this.selectedId) return;
    const obj = this.viewer.getObjectById(this.selectedId);
    if (!obj) return;
    const blob = await this.converter.toOBJ(obj, {
      center: this.center,
      unitScale: this.unitScale,
    });
    this.downloadBlob(blob, this.deriveBaseName("obj"));
  }

  async onExportSelectedSTL() {
    if (!this.selectedId) return;
    const obj = this.viewer.getObjectById(this.selectedId);
    if (!obj) return;
    const blob = await this.converter.toSTL(obj, {
      center: this.center,
      unitScale: this.unitScale,
    });
    this.downloadBlob(blob, this.deriveBaseName("stl"));
  }
}
