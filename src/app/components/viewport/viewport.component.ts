import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { ModelService, ModelState } from '../../services/model.service';
import { ViewerService, CameraState } from '../../services/viewer.service';
import { ModelRegistry } from '../../../core/registry/ModelRegistry';
import { attachCameraAndControls } from '../../../core/services/fitView';

@Component({
  selector: 'app-viewport',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewport"
         (dragenter)="onDragEnter($event)"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)">
      <canvas #canvas></canvas>
      
      @if (dragging) {
        <div class="overlay" style="pointer-events: none;"></div>
      }
      
      @if (!hasModel && !dragging) {
        <div class="dropzone">
          <div>
            <div style="font-weight: 600; margin-bottom: 6px;"></div>
            <div style="opacity: 0.8;"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ViewportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  dragging = false;
  hasModel = false;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private modelRoot!: THREE.Group;
  private destroy$ = new Subject<void>();
  private applyingCamera = false;
  private rafId: number | null = null;
  private savedCamera: CameraState | null = null;

  constructor(
    private modelService: ModelService,
    private viewerService: ViewerService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Subscribe to model state
    this.modelService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: ModelState) => {
        this.hasModel = !!state.tree;
      });

    // Subscribe to viewer state for camera
    this.viewerService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.savedCamera = state.camera;
        this.applySavedCamera();
      });
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    this.controls?.dispose();
    this.renderer?.dispose();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f1419);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(2, 2, 4);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    attachCameraAndControls(this.camera, this.controls);

    // Listen to controls changes to persist camera
    this.controls.addEventListener('change', () => {
      if (this.applyingCamera) return;
      
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
      }
      
      this.rafId = requestAnimationFrame(() => {
        const p = this.camera.position;
        const t = this.controls.target;
        const nextPos = [p.x, p.y, p.z];
        const nextTgt = [t.x, t.y, t.z];
        
        // Check if actually changed
        const cur = this.savedCamera || {};
        if (!this.arraysAlmostEqual(nextPos, cur.position) || 
            !this.arraysAlmostEqual(nextTgt, cur.target)) {
          this.viewerService.setCamera(nextPos, nextTgt);
        }
      });
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x2a3246, 0x222a3b);
    this.scene.add(gridHelper);

    // Model root group
    this.modelRoot = new THREE.Group();
    this.scene.add(this.modelRoot);

    // Apply saved camera if available
    this.applySavedCamera();

    // Set canvas ready
    this.viewerService.setCanvasReady(true);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Add model from registry if available
    const registryRoot = ModelRegistry.getRoot();
    if (registryRoot && !this.modelRoot.children.includes(registryRoot)) {
      this.modelRoot.add(registryRoot);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private applySavedCamera(): void {
    if (!this.savedCamera || !this.controls || !this.camera) return;

    const { position, target } = this.savedCamera;
    const curPos = [this.camera.position.x, this.camera.position.y, this.camera.position.z];
    const curTgt = [this.controls.target.x, this.controls.target.y, this.controls.target.z];
    
    const posChanged = Array.isArray(position) && !this.arraysAlmostEqual(position, curPos);
    const tgtChanged = Array.isArray(target) && !this.arraysAlmostEqual(target, curTgt);
    
    if (!posChanged && !tgtChanged) return;

    this.applyingCamera = true;
    try {
      if (posChanged && position) {
        this.camera.position.set(position[0], position[1], position[2]);
      }
      if (tgtChanged && target) {
        this.controls.target.set(target[0], target[1], target[2]);
      }
      this.controls.update();
    } finally {
      requestAnimationFrame(() => {
        this.applyingCamera = false;
      });
    }
  }

  private arraysAlmostEqual(a: any, b: any, eps: number = 1e-6): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((v, i) => Math.abs(v - b[i]) < eps);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.camera || !this.renderer || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(x, y);
    raycaster.setFromCamera(pointer, this.camera);

    const root = ModelRegistry.getRoot();
    if (!root) return;

    const intersects = raycaster.intersectObjects(root.children, true);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      const id = (obj.userData as any).__nodeId;
      if (id) {
        this.modelService.selectNode(id);
        this.viewerService.fitToSelection();
      }
    }
  }

  onDragEnter(event: DragEvent): void {
    this.preventDefault(event);
    this.dragging = true;
  }

  onDragOver(event: DragEvent): void {
    this.preventDefault(event);
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    this.preventDefault(event);
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    this.preventDefault(event);
    this.dragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      if (files.length === 1) {
        this.modelService.loadModel(files[0]);
      } else if (files.length > 1) {
        this.modelService.loadModel(undefined, files);
      }
    }
  }

  private preventDefault(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
