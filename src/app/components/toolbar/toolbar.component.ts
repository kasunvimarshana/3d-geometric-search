import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelService } from '../../services/model.service';
import { ViewerService } from '../../services/viewer.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toolbar">
      <button class="btn" (click)="fileInput.click()">Open Model</button>
      <input 
        #fileInput
        type="file" 
        accept=".glb,.gltf,.bin,.obj,.mtl,.stl,.stp,.step,.png,.jpg,.jpeg,.gif,.bmp,.webp,.tga,.ktx2,.dds" 
        multiple 
        (change)="onFile($event)" 
        style="display: none;"
      />
      <button class="btn" (click)="fitToAll()">Fit All</button>
      <button class="btn" (click)="resetView()">Reset View</button>
      <button class="btn" (click)="toggleFullscreen()">Fullscreen</button>
    </div>
  `,
  styles: []
})
export class ToolbarComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private modelService: ModelService,
    private viewerService: ViewerService
  ) {}

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files) {
      if (files.length === 1) {
        this.modelService.loadModel(files[0]);
      } else if (files.length > 1) {
        this.modelService.loadModel(undefined, files);
      }
    }
    
    // Reset input value to allow loading the same file again
    input.value = '';
  }

  fitToAll(): void {
    this.viewerService.fitToAll();
  }

  resetView(): void {
    this.viewerService.resetView();
  }

  toggleFullscreen(): void {
    this.viewerService.toggleFullscreen();
  }
}
