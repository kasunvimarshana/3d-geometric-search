import { IRenderer } from "@domain/interfaces";
import { Model, ModelSection } from "@domain/types";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Three.js Renderer
 * Implements IRenderer using Three.js
 * Handles all 3D visualization and interaction
 */
export class ThreeRenderer implements IRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private container?: HTMLElement;
  private animationFrameId?: number;

  private sectionMeshes: Map<string, THREE.Object3D>;
  private originalMaterials: Map<string, THREE.Material | THREE.Material[]>;
  private highlightMaterial: THREE.MeshStandardMaterial;
  private model?: Model;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.sectionMeshes = new Map();
    this.originalMaterials = new Map();

    // Create highlight material
    this.highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });

    this.setupScene();
  }

  private setupScene(): void {
    // Scene setup
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(1, 1, 1);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    this.scene.add(directionalLight2);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xeeeeee);
    this.scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(2);
    this.scene.add(axesHelper);

    // Camera setup
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls setup
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;
  }

  initialize(container: HTMLElement): void {
    this.container = container;

    // Set renderer size
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Append renderer to container
    container.appendChild(this.renderer.domElement);

    // Handle window resize
    window.addEventListener("resize", this.handleResize.bind(this));

    // Add mouse wheel event for zooming
    this.renderer.domElement.addEventListener(
      "wheel",
      this.handleWheel.bind(this),
      { passive: false }
    );

    // Start render loop
    this.startRenderLoop();
  }

  loadModel(model: Model): void {
    this.model = model;
    this.clearScene();

    // Create meshes for each section
    model.sections.forEach((section, sectionId) => {
      const mesh = this.createMeshFromSection(section, model);
      if (mesh) {
        this.scene.add(mesh);
        this.sectionMeshes.set(sectionId, mesh);

        // Store original material
        if (mesh instanceof THREE.Mesh) {
          this.originalMaterials.set(sectionId, mesh.material);
        }
      }
    });

    // Fit camera to model
    this.fitCameraToModel();
  }

  private createMeshFromSection(
    section: ModelSection,
    model: Model
  ): THREE.Object3D | null {
    if (!section.geometryId || !section.materialId) {
      return null;
    }

    const geometryData = model.geometries.get(section.geometryId);
    const materialData = model.materials.get(section.materialId);

    if (!geometryData || !materialData) {
      return null;
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array(geometryData.vertices);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    if (geometryData.normals) {
      const normals = new Float32Array(geometryData.normals);
      geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    } else {
      geometry.computeVertexNormals();
    }

    if (geometryData.uvs) {
      const uvs = new Float32Array(geometryData.uvs);
      geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    }

    if (geometryData.indices) {
      const indices = new Uint32Array(geometryData.indices);
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: materialData.color || "#cccccc",
      metalness: materialData.metalness || 0.1,
      roughness: materialData.roughness || 0.8,
      transparent: materialData.transparent || false,
      opacity: materialData.opacity || 1.0,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = section.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Apply transform
    mesh.position.set(
      section.transform.position.x,
      section.transform.position.y,
      section.transform.position.z
    );
    mesh.rotation.set(
      section.transform.rotation.x,
      section.transform.rotation.y,
      section.transform.rotation.z
    );
    mesh.scale.set(
      section.transform.scale.x,
      section.transform.scale.y,
      section.transform.scale.z
    );

    mesh.visible = section.visible;

    return mesh;
  }

  updateSection(
    sectionId: string,
    properties: Partial<{ visible: boolean; highlighted: boolean }>
  ): void {
    const mesh = this.sectionMeshes.get(sectionId);
    if (!mesh) return;

    if (properties.visible !== undefined) {
      mesh.visible = properties.visible;
    }

    if (properties.highlighted !== undefined && mesh instanceof THREE.Mesh) {
      if (properties.highlighted) {
        this.highlightSection(sectionId, true);
      } else {
        this.dehighlightSection(sectionId, true);
      }
    }
  }

  highlightSection(sectionId: string, animated = true): void {
    const mesh = this.sectionMeshes.get(sectionId);
    if (!mesh || !(mesh instanceof THREE.Mesh)) return;

    if (!this.originalMaterials.has(sectionId)) {
      this.originalMaterials.set(sectionId, mesh.material);
    }

    if (animated) {
      this.animateHighlight(mesh, true);
    } else {
      mesh.material = this.highlightMaterial;
    }
  }

  dehighlightSection(sectionId: string, animated = true): void {
    const mesh = this.sectionMeshes.get(sectionId);
    if (!mesh || !(mesh instanceof THREE.Mesh)) return;

    const originalMaterial = this.originalMaterials.get(sectionId);
    if (!originalMaterial) return;

    if (animated) {
      this.animateHighlight(mesh, false);
    } else {
      mesh.material = originalMaterial;
    }
  }

  private animateHighlight(mesh: THREE.Mesh, highlight: boolean): void {
    const duration = 300; // ms
    const startTime = Date.now();
    const targetMaterial = highlight
      ? this.highlightMaterial
      : this.originalMaterials.get(mesh.name);

    if (!targetMaterial) return;

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        mesh.material = targetMaterial;
        return;
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  focusSection(sectionId: string, animated = true): void {
    const mesh = this.sectionMeshes.get(sectionId);
    if (!mesh) return;

    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // Zoom out a bit

    const targetPosition = new THREE.Vector3(
      center.x,
      center.y,
      center.z + cameraZ
    );

    if (animated) {
      this.animateCameraToPosition(targetPosition, center);
    } else {
      this.camera.position.copy(targetPosition);
      this.controls.target.copy(center);
      this.controls.update();
    }
  }

  isolateSections(sectionIds: string[]): void {
    const isolatedSet = new Set(sectionIds);

    this.sectionMeshes.forEach((mesh, id) => {
      mesh.visible = isolatedSet.has(id);
    });
  }

  showAllSections(): void {
    this.sectionMeshes.forEach((mesh) => {
      mesh.visible = true;
    });
  }

  resetView(animated = true): void {
    const targetPosition = new THREE.Vector3(5, 5, 5);
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    if (animated) {
      this.animateCameraToPosition(targetPosition, targetLookAt);
    } else {
      this.camera.position.copy(targetPosition);
      this.controls.target.copy(targetLookAt);
      this.controls.update();
    }

    // Reset model scale to 1.0
    if (this.model) {
      this.resetModelScale(animated);
    }
  }

  fitToScreen(animated = true, margin = 1.2): void {
    // Get all visible meshes
    const visibleMeshes = Array.from(this.sectionMeshes.values()).filter(
      (mesh) => mesh.visible
    );

    if (visibleMeshes.length === 0) return;

    // Calculate bounding box of visible meshes
    const boundingBox = new THREE.Box3();
    visibleMeshes.forEach((mesh) => {
      const meshBox = new THREE.Box3().setFromObject(mesh);
      boundingBox.union(meshBox);
    });

    // Get bounding box center and size
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // Calculate the maximum dimension
    const maxDim = Math.max(size.x, size.y, size.z);

    // Get camera parameters
    const fov = this.camera.fov * (Math.PI / 180); // Convert to radians
    const aspect = this.camera.aspect;

    // Calculate required distance to fit the model in viewport
    // Consider both vertical and horizontal FOV
    const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    const verticalDistance = maxDim / (2 * Math.tan(fov / 2));
    const horizontalDistance = maxDim / (2 * Math.tan(horizontalFov / 2));

    // Use the larger distance to ensure full fit
    let distance = Math.max(verticalDistance, horizontalDistance);

    // Apply margin for comfortable viewing
    distance *= margin;

    // Calculate camera position maintaining current viewing direction
    const currentDirection = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize();
    const targetPosition = center
      .clone()
      .add(currentDirection.multiplyScalar(distance));

    // Adjust near and far clipping planes dynamically
    const depth = size.length(); // Diagonal of bounding box
    this.camera.near = Math.max(0.1, distance - depth * 0.6);
    this.camera.far = distance + depth * 0.6;
    this.camera.updateProjectionMatrix();

    // Update controls distance limits
    this.controls.minDistance = distance * 0.1;
    this.controls.maxDistance = distance * 10;

    // Animate camera to new position
    if (animated) {
      this.animateCameraToPosition(targetPosition, center);
    } else {
      this.camera.position.copy(targetPosition);
      this.controls.target.copy(center);
      this.controls.update();
    }
  }

  private resetModelScale(animated = false): void {
    if (!this.model) return;

    // Reset each mesh to original scale and position
    this.model.sections.forEach((section, sectionId) => {
      const mesh = this.sectionMeshes.get(sectionId);
      if (!mesh) return;

      const targetScale = new THREE.Vector3(
        section.transform.scale.x,
        section.transform.scale.y,
        section.transform.scale.z
      );

      const targetPosition = new THREE.Vector3(
        section.transform.position.x,
        section.transform.position.y,
        section.transform.position.z
      );

      if (animated) {
        this.animateResetMesh(mesh, targetScale, targetPosition);
      } else {
        mesh.scale.copy(targetScale);
        mesh.position.copy(targetPosition);
      }
    });
  }

  private animateResetMesh(
    mesh: THREE.Object3D,
    targetScale: THREE.Vector3,
    targetPosition: THREE.Vector3
  ): void {
    const duration = 500;
    const startTime = Date.now();
    const startScale = mesh.scale.clone();
    const startPosition = mesh.position.clone();

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutCubic(progress);

      mesh.scale.lerpVectors(startScale, targetScale, eased);
      mesh.position.lerpVectors(startPosition, targetPosition, eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  zoom(
    delta: number,
    point?: { x: number; y: number },
    animated = false
  ): void {
    const zoomSpeed = 0.05;
    const zoomFactor = 1 + delta * zoomSpeed;

    // Get the focus point for zooming
    const focusPoint = point
      ? this.getWorldPointFromScreen(point.x, point.y)
      : this.controls.target.clone();

    // Calculate new camera position zooming toward focus point
    const direction = this.camera.position.clone().sub(focusPoint);
    const currentDistance = direction.length();
    const newDistance = currentDistance / zoomFactor;

    // Apply zoom limits
    const minDistance = this.controls.minDistance;
    const maxDistance = this.controls.maxDistance;
    const clampedDistance = Math.max(
      minDistance,
      Math.min(maxDistance, newDistance)
    );

    if (animated) {
      this.animateZoom(focusPoint, clampedDistance);
    } else {
      direction.normalize().multiplyScalar(clampedDistance);
      this.camera.position.copy(focusPoint).add(direction);
      this.controls.update();
    }
  }

  scaleModel(scaleFactor: number, animated = false): void {
    if (!this.model) return;

    // Get bounding box center
    const box = new THREE.Box3(
      new THREE.Vector3(
        this.model.boundingBox.min.x,
        this.model.boundingBox.min.y,
        this.model.boundingBox.min.z
      ),
      new THREE.Vector3(
        this.model.boundingBox.max.x,
        this.model.boundingBox.max.y,
        this.model.boundingBox.max.z
      )
    );
    const center = box.getCenter(new THREE.Vector3());

    if (animated) {
      this.animateScale(scaleFactor, center);
    } else {
      this.applyScaleToAllMeshes(scaleFactor, center);
    }
  }

  private applyScaleToAllMeshes(
    scaleFactor: number,
    center: THREE.Vector3
  ): void {
    this.sectionMeshes.forEach((mesh) => {
      // Scale the mesh
      mesh.scale.multiplyScalar(scaleFactor);

      // Adjust position relative to center
      const offsetFromCenter = mesh.position.clone().sub(center);
      offsetFromCenter.multiplyScalar(scaleFactor);
      mesh.position.copy(center).add(offsetFromCenter);
    });
  }

  setFullscreen(enabled: boolean): void {
    if (!this.container) return;

    if (enabled) {
      this.container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.clearScene();
    this.renderer.dispose();
    this.controls.dispose();

    window.removeEventListener("resize", this.handleResize.bind(this));

    if (this.renderer.domElement) {
      this.renderer.domElement.removeEventListener(
        "wheel",
        this.handleWheel.bind(this)
      );
    }
  }

  render(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private handleWheel(event: WheelEvent): void {
    // Prevent default zoom behavior
    event.preventDefault();

    const delta = event.deltaY > 0 ? -1 : 1;
    const point = { x: event.clientX, y: event.clientY };

    // Check for Ctrl key for scaling instead of zooming
    if (event.ctrlKey) {
      const scaleFactor = delta > 0 ? 1.05 : 0.95;
      this.scaleModel(scaleFactor, false);
    } else {
      this.zoom(delta, point, false);
    }
  }

  private clearScene(): void {
    this.sectionMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      if (mesh instanceof THREE.Mesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    this.sectionMeshes.clear();
    this.originalMaterials.clear();
  }

  private fitCameraToModel(): void {
    if (!this.model) return;

    const box = new THREE.Box3(
      new THREE.Vector3(
        this.model.boundingBox.min.x,
        this.model.boundingBox.min.y,
        this.model.boundingBox.min.z
      ),
      new THREE.Vector3(
        this.model.boundingBox.max.x,
        this.model.boundingBox.max.y,
        this.model.boundingBox.max.z
      )
    );

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 2; // Zoom out a bit

    this.camera.position.set(
      center.x + cameraZ,
      center.y + cameraZ,
      center.z + cameraZ
    );
    this.controls.target.copy(center);
    this.controls.update();
  }

  private animateCameraToPosition(
    targetPosition: THREE.Vector3,
    targetLookAt: THREE.Vector3
  ): void {
    const duration = 1000; // ms
    const startTime = Date.now();
    const startPosition = this.camera.position.clone();
    const startLookAt = this.controls.target.clone();

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutCubic(progress);

      this.camera.position.lerpVectors(startPosition, targetPosition, eased);
      this.controls.target.lerpVectors(startLookAt, targetLookAt, eased);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private animateZoom(focusPoint: THREE.Vector3, targetDistance: number): void {
    const duration = 300; // ms
    const startTime = Date.now();
    const startPosition = this.camera.position.clone();
    const direction = startPosition.clone().sub(focusPoint);
    const startDistance = direction.length();

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutCubic(progress);

      const currentDistance =
        startDistance + (targetDistance - startDistance) * eased;
      direction.normalize().multiplyScalar(currentDistance);
      this.camera.position.copy(focusPoint).add(direction);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private animateScale(scaleFactor: number, center: THREE.Vector3): void {
    const duration = 500; // ms
    const startTime = Date.now();

    // Store initial positions and scales
    const initialStates = new Map<
      string,
      { position: THREE.Vector3; scale: THREE.Vector3 }
    >();
    this.sectionMeshes.forEach((mesh, id) => {
      initialStates.set(id, {
        position: mesh.position.clone(),
        scale: mesh.scale.clone(),
      });
    });

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutCubic(progress);

      this.sectionMeshes.forEach((mesh, id) => {
        const initial = initialStates.get(id);
        if (!initial) return;

        // Interpolate scale
        const currentScale =
          initial.scale.x +
          (initial.scale.x * scaleFactor - initial.scale.x) * eased;
        mesh.scale.set(currentScale, currentScale, currentScale);

        // Interpolate position relative to center
        const initialOffsetFromCenter = initial.position.clone().sub(center);
        const targetOffsetFromCenter = initialOffsetFromCenter
          .clone()
          .multiplyScalar(scaleFactor);
        const currentOffsetFromCenter = initialOffsetFromCenter
          .clone()
          .lerp(targetOffsetFromCenter, eased);
        mesh.position.copy(center).add(currentOffsetFromCenter);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private getWorldPointFromScreen(x: number, y: number): THREE.Vector3 {
    if (!this.container) return this.controls.target.clone();

    const rect = this.container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((x - rect.left) / rect.width) * 2 - 1,
      -((y - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Try to intersect with model meshes
    const meshArray = Array.from(this.sectionMeshes.values()).filter(
      (mesh) => mesh instanceof THREE.Mesh && mesh.visible
    ) as THREE.Mesh[];

    const intersects = raycaster.intersectObjects(meshArray, false);

    if (intersects.length > 0) {
      return intersects[0].point;
    }

    // If no intersection, use controls target
    return this.controls.target.clone();
  }

  private startRenderLoop(): void {
    const animate = (): void => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }

  private handleResize(): void {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
