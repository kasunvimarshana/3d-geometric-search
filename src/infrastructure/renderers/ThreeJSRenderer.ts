/**
 * Three.js Renderer
 *
 * Implementation of IRenderer using Three.js.
 * Handles 3D scene rendering, camera control, and visual effects.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { IRenderer, CameraPosition } from '@domain/interfaces/IRenderer';
import { Model } from '@domain/models/Model';
import { ModelSection } from '@domain/models/ModelSection';

export class ThreeJSRenderer implements IRenderer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private container!: HTMLElement;

  private modelGroup: THREE.Group | null = null;
  private highlightedMesh: THREE.Mesh | null = null;
  private originalMaterial: THREE.Material | null = null;

  private gridHelper: THREE.GridHelper | null = null;
  private axesHelper: THREE.AxesHelper | null = null;

  private animationFrameId: number | null = null;

  // Click handling
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private clickHandler: ((event: MouseEvent) => void) | null = null;
  private onSectionClickCallback: ((sectionId: string, event: MouseEvent) => void) | null = null;
  private onViewportClickCallback: ((event: MouseEvent) => void) | null = null;

  initialize(container: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      this.container = container;

      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf5f5f5);

      // Create camera
      const aspect = container.clientWidth / container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 10000);
      this.camera.position.set(5, 5, 5);

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      container.appendChild(this.renderer.domElement);

      // Create controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;

      // Add lights
      this.setupLighting();

      // Add helpers
      this.setupHelpers();

      // Start animation loop
      this.animate();

      resolve();
    });
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.controls.dispose();
    this.renderer.dispose();

    if (this.container && this.renderer.domElement.parentElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  render(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize(): void {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  loadModel(model: Model, threeJsObject?: unknown): Promise<void> {
    return new Promise((resolve) => {
      // Clear existing model
      this.clearScene();

      // Create group for model
      this.modelGroup = new THREE.Group();

      if (threeJsObject && typeof threeJsObject === 'object' && 'isObject3D' in threeJsObject) {
        // Clone the loaded Three.js object
        this.modelGroup.add(threeJsObject as THREE.Object3D);
      } else {
        // Fallback: create placeholder geometry if no Three.js object provided
        console.warn(
          'No Three.js object provided, creating placeholder for model:',
          model.metadata.filename
        );
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
          color: 0x3498db,
          metalness: 0.3,
          roughness: 0.7,
        });
        const cube = new THREE.Mesh(geometry, material);
        this.modelGroup.add(cube);
      }

      this.scene.add(this.modelGroup);

      // Fit to view
      this.fitToView();

      resolve();
    });
  }

  clearScene(): void {
    if (this.modelGroup) {
      this.scene.remove(this.modelGroup);
      this.disposeGroup(this.modelGroup);
      this.modelGroup = null;
    }
    this.clearHighlight();
  }

  highlightSection(section: ModelSection): void {
    this.clearHighlight();

    if (!this.modelGroup) return;

    // Find mesh by section ID using userData
    let foundMesh: THREE.Mesh | undefined;
    this.modelGroup.traverse((child) => {
      if (child.userData.sectionId === section.id && child instanceof THREE.Mesh) {
        foundMesh = child;
      }
    });

    if (foundMesh && foundMesh.material) {
      this.highlightedMesh = foundMesh;
      this.originalMaterial = Array.isArray(foundMesh.material)
        ? (foundMesh.material[0] as THREE.Material)
        : foundMesh.material;

      // Create highlight material
      const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b6b,
        emissive: 0xff6b6b,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.7,
      });

      foundMesh.material = highlightMaterial;
    }
  }

  clearHighlight(): void {
    if (this.highlightedMesh && this.originalMaterial) {
      this.highlightedMesh.material = this.originalMaterial;
      this.highlightedMesh = null;
      this.originalMaterial = null;
    }
  }

  focusOnSection(section: ModelSection): void {
    if (!section.boundingBox) {
      this.fitToView();
      return;
    }

    const box = section.boundingBox;
    const center = new THREE.Vector3(
      (box.min.x + box.max.x) / 2,
      (box.min.y + box.max.y) / 2,
      (box.min.z + box.max.z) / 2
    );

    const size = new THREE.Vector3(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z
    );

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;

    this.camera.position.set(center.x + distance, center.y + distance, center.z + distance);
    this.controls.target.copy(center);
    this.controls.update();
  }

  resetCamera(): void {
    this.camera.position.set(5, 5, 5);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  fitToView(): void {
    if (!this.modelGroup || this.modelGroup.children.length === 0) return;

    const box = new THREE.Box3().setFromObject(this.modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;

    this.camera.position.set(center.x + distance, center.y + distance, center.z + distance);
    this.controls.target.copy(center);
    this.controls.update();
  }

  setWireframe(enabled: boolean): void {
    if (!this.modelGroup) return;

    this.modelGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.wireframe = enabled;
          });
        } else {
          child.material.wireframe = enabled;
        }
      }
    });
  }

  setGridVisible(visible: boolean): void {
    if (this.gridHelper) {
      this.gridHelper.visible = visible;
    }
  }

  setAxesVisible(visible: boolean): void {
    if (this.axesHelper) {
      this.axesHelper.visible = visible;
    }
  }

  zoomIn(): void {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    this.camera.position.addScaledVector(direction, 1);
  }

  zoomOut(): void {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    this.camera.position.addScaledVector(direction, -1);
  }

  getCameraPosition(): CameraPosition {
    return {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };
  }

  setCameraPosition(position: CameraPosition): void {
    this.camera.position.set(position.x, position.y, position.z);
    this.controls.update();
  }

  enableClickHandling(
    onSectionClick: (sectionId: string, event: MouseEvent) => void,
    onViewportClick: (event: MouseEvent) => void
  ): void {
    try {
      if (!this.renderer || !this.renderer.domElement) {
        console.error('[Renderer] Cannot enable click handling: renderer not initialized');
        return;
      }

      // Store callbacks
      this.onSectionClickCallback = onSectionClick;
      this.onViewportClickCallback = onViewportClick;

      // Create click handler
      this.clickHandler = (event: MouseEvent) => {
        try {
          // Prevent default behavior
          event.preventDefault();

          // Calculate mouse position in normalized device coordinates (-1 to +1)
          const rect = this.renderer.domElement.getBoundingClientRect();
          this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          // Update raycaster
          this.raycaster.setFromCamera(this.mouse, this.camera);

          // Check for intersections with model
          if (this.modelGroup) {
            const intersects = this.raycaster.intersectObjects(this.modelGroup.children, true);

            if (intersects.length > 0 && intersects[0]) {
              // Find the clicked object with userData.sectionId
              let clickedObject = intersects[0].object;
              let sectionId: string | null = null;

              // Traverse up the hierarchy to find sectionId
              while (clickedObject && !sectionId) {
                if (clickedObject.userData && clickedObject.userData.sectionId) {
                  sectionId = clickedObject.userData.sectionId;
                  break;
                }
                clickedObject = clickedObject.parent as THREE.Object3D;
              }

              if (sectionId && this.onSectionClickCallback) {
                this.onSectionClickCallback(sectionId, event);
                return;
              }
            }
          }

          // No section clicked, treat as viewport click
          if (this.onViewportClickCallback) {
            this.onViewportClickCallback(event);
          }
        } catch (error) {
          console.error('[Renderer] Error handling click:', error);
        }
      };

      // Add event listener
      this.renderer.domElement.addEventListener('click', this.clickHandler);
      console.log('[Renderer] Click handling enabled');
    } catch (error) {
      console.error('[Renderer] Error enabling click handling:', error);
    }
  }

  disableClickHandling(): void {
    try {
      if (this.clickHandler && this.renderer && this.renderer.domElement) {
        this.renderer.domElement.removeEventListener('click', this.clickHandler);
        this.clickHandler = null;
        this.onSectionClickCallback = null;
        this.onViewportClickCallback = null;
        console.log('[Renderer] Click handling disabled');
      }
    } catch (error) {
      console.error('[Renderer] Error disabling click handling:', error);
    }
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional lights
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(5, 10, 7);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
    light2.position.set(-5, -10, -7);
    this.scene.add(light2);
  }

  private setupHelpers(): void {
    // Grid helper
    this.gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xe0e0e0);
    this.scene.add(this.gridHelper);

    // Axes helper
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.render();
  };

  private disposeGroup(group: THREE.Group): void {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
