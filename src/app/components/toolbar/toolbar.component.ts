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
  private lastLoadedFileName?: string;
  unitScale = 1.0;
  center = true;
  gltfBinary = true;
  stlBinary = true;
  gltfEmbedImages = true;
  gltfOnlyVisible = true;
  gltfPreset: "binary" | "json-embedded" | "json-external" = "binary";

  get gltfExt(): string {
    return this.gltfBinary ? "glb" : "gltf";
  }

  get gltfLabel(): string {
    if (!this.gltfBinary && this.gltfPreset === "json-external") return "zip";
    return this.gltfExt;
  }

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
    this.lastLoadedFileName$.subscribe(
      (n) => (this.lastLoadedFileName = n ?? undefined)
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
    const name = this.lastLoadedFileName?.trim();
    if (name && name.length) {
      const idx = name.lastIndexOf(".");
      const base = idx > 0 ? name.substring(0, idx) : name;
      return `${base}.${ext}`;
    }
    return `model.${ext}`;
  }

  async onExportGLTF() {
    const root = this.viewer.getRootObject();
    if (!root) return;
    if (!this.gltfBinary && this.gltfPreset === "json-external") {
      // Package to ZIP for external assets
      await this.exportGltfZip(root);
      return;
    }
    const blob = await this.converter.toGLTF(root, {
      center: this.center,
      unitScale: this.unitScale,
      binary: this.gltfBinary,
      embedImages: this.gltfEmbedImages,
      onlyVisible: this.gltfOnlyVisible,
    });
    const ext = this.gltfBinary ? "glb" : "gltf";
    this.downloadBlob(blob, this.deriveBaseName(ext));
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
      binary: this.stlBinary,
    });
    this.downloadBlob(blob, this.deriveBaseName("stl"));
  }

  async onExportSelectedGLTF() {
    if (!this.selectedId) return;
    const obj = this.viewer.getObjectById(this.selectedId);
    if (!obj) return;
    if (!this.gltfBinary && this.gltfPreset === "json-external") {
      await this.exportGltfZip(obj);
      return;
    }
    const blob = await this.converter.toGLTF(obj, {
      center: this.center,
      unitScale: this.unitScale,
      binary: this.gltfBinary,
      embedImages: this.gltfEmbedImages,
      onlyVisible: this.gltfOnlyVisible,
    });
    const ext = this.gltfBinary ? "glb" : "gltf";
    this.downloadBlob(blob, this.deriveBaseName(ext));
  }

  private async exportGltfZip(object: any) {
    const pkg = await this.converter.toGLTFPackage(object, {
      center: this.center,
      unitScale: this.unitScale,
      embedImages: false,
      onlyVisible: this.gltfOnlyVisible,
    });
    const jszipMod: any = await import("jszip");
    const JSZip = jszipMod.default || jszipMod;
    const zip = new JSZip();
    const base = this.deriveBaseName("gltf").replace(/\.gltf$/i, "");
    zip.file(`${base}.gltf`, pkg.gltf);
    for (const asset of pkg.assets) {
      zip.file(asset.name, asset.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    this.downloadBlob(blob, `${base}.zip`);
  }

  onChangeGltfPreset(val: string) {
    this.gltfPreset = val as any;
    if (val === "binary") {
      this.gltfBinary = true;
      this.gltfEmbedImages = true; // ignored in binary
    } else if (val === "json-embedded") {
      this.gltfBinary = false;
      this.gltfEmbedImages = true;
    } else {
      this.gltfBinary = false;
      this.gltfEmbedImages = false;
    }
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
      binary: this.stlBinary,
    });
    this.downloadBlob(blob, this.deriveBaseName("stl"));
  }
}
