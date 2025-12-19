import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { ThreeViewerService } from "../../core/services/three-viewer.service";

@Component({
  selector: "app-viewer-canvas",
  templateUrl: "./viewer-canvas.component.html",
})
export class ViewerCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild("canvasRef", { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  constructor(private viewer: ThreeViewerService) {}

  ngAfterViewInit(): void {
    this.viewer.attach(this.canvasRef.nativeElement);
    this.viewer.start();

    // ViewerEffects handles fit/reset/fullscreen side-effects centrally
  }

  ngOnDestroy(): void {
    this.viewer.dispose();
  }
}
