/**
 * 3D Model Viewer Component
 * Handles rendering, camera controls, and visual effects
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Model3D } from "../domain/types";
import { EventBus } from "../core/EventBus";
import { EventType } from "../domain/events";

export class ModelViewer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private eventBus: EventBus;
  private animationFrameId: number | null = null;

  // Model-related
  private modelGroup: THREE.Group;
  private meshMap: Map<string, THREE.Mesh> = new Map();
  private originalMaterials: Map<string, THREE.Material> = new Map();

  // Highlight materials
  private highlightMaterial: THREE.MeshStandardMaterial;
  private selectedMaterial: THREE.MeshStandardMaterial;

  // Lighting
  private lights: THREE.Light[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.eventBus = EventBus.getInstance();
    this.modelGroup = new THREE.Group();

    // Initialize materials
    this.highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9,
    });

    this.selectedMaterial = new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.95,
    });

    this.scene = this.initScene();
    this.camera = this.initCamera();
    this.renderer = this.initRenderer();
    this.controls = this.initControls();
    this.initLights();
    this.initEventListeners();

    // Set initial camera position for empty scene
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
    this.controls.update();

    this.animate();
  }

  private initScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.add(this.modelGroup);
    return scene;
  }

  private initCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      10000
    );
    camera.position.set(5, 5, 5);
    return camera;
  }

  private initRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(renderer.domElement);
    return renderer;
  }

  private initControls(): OrbitControls {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 5000;
    controls.maxPolarAngle = Math.PI;
    return controls;
  }

  private initLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 0, -10);
    this.scene.add(fillLight);
    this.lights.push(fillLight);
  }

  private initEventListeners(): void {
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Listen to model events
    this.eventBus.on(EventType.MODEL_LOADED, (event) => {
      if (event.type === EventType.MODEL_LOADED) {
        this.loadModel(event.model);
      }
    });

    this.eventBus.on(EventType.SECTION_SELECTED, (event) => {
      if (event.type === EventType.SECTION_SELECTED) {
        this.selectSection(event.sectionId);
      }
    });

    this.eventBus.on(EventType.SECTION_DESELECTED, (event) => {
      if (event.type === EventType.SECTION_DESELECTED) {
        this.deselectSection(event.sectionId);
      }
    });

    this.eventBus.on(EventType.SECTION_HIGHLIGHTED, (event) => {
      if (event.type === EventType.SECTION_HIGHLIGHTED) {
        this.highlightSection(event.sectionId);
      }
    });

    this.eventBus.on(EventType.SECTION_DEHIGHLIGHTED, (event) => {
      if (event.type === EventType.SECTION_DEHIGHLIGHTED) {
        this.dehighlightSection(event.sectionId);
      }
    });

    this.eventBus.on(EventType.VIEW_RESET, () => {
      this.resetView();
    });

    this.eventBus.on(EventType.MODEL_DISASSEMBLED, () => {
      this.disassembleModel();
    });

    this.eventBus.on(EventType.MODEL_REASSEMBLED, () => {
      this.reassembleModel();
    });
  }

  /**
   * Load a 3D model into the scene
   */
  loadModel(model: Model3D): void {
    // Clear existing model
    this.clearModel();

    // Load the actual THREE.js scene if available
    if (model.threeScene) {
      this.loadActualModel(model);
    } else {
      // Fallback to placeholder if no scene is provided
      this.createPlaceholderModel(model);
    }

    // Fit camera to model
    this.fitCameraToModel();
  }

  private loadActualModel(model: Model3D): void {
    // Add the actual THREE.js scene to the model group (don't clone to preserve UUIDs)
    this.modelGroup.add(model.threeScene);

    // Build a map of original UUIDs to objects before any modifications
    const uuidMap = new Map<string, THREE.Object3D>();
    model.threeScene.traverse((object: any) => {
      uuidMap.set(object.uuid, object);
    });

    // Map meshes to sections using the stored meshId
    for (const [sectionId, section] of model.sections.entries()) {
      if (section.meshId) {
        const object = uuidMap.get(section.meshId);
        if (object && object instanceof THREE.Mesh) {
          this.meshMap.set(sectionId, object);

          // Store original material
          if (object.material) {
            const material = Array.isArray(object.material)
              ? object.material[0]
              : object.material;
            this.originalMaterials.set(sectionId, material);
          }

          // Enable shadows
          object.castShadow = true;
          object.receiveShadow = true;
        }
      }
    }

    console.log(
      `Loaded model with ${this.meshMap.size} meshes from ${model.sections.size} sections`
    );
  }

  private createPlaceholderModel(model: Model3D): void {
    // Create a simple placeholder representation
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Map first section to this mesh
    if (model.sections.size > 0) {
      const firstSection = Array.from(model.sections.values())[0];
      this.meshMap.set(firstSection.id, mesh);
      this.originalMaterials.set(firstSection.id, material);
    }

    this.modelGroup.add(mesh);
  }

  private clearModel(): void {
    // Remove all meshes from the scene
    while (this.modelGroup.children.length > 0) {
      const child = this.modelGroup.children[0];
      this.modelGroup.remove(child);

      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    this.meshMap.clear();
    this.originalMaterials.clear();
  }

  /**
   * Highlight a section with smooth transition
   */
  highlightSection(sectionId: string): void {
    const mesh = this.meshMap.get(sectionId);
    if (!mesh) {
      console.warn(`Cannot highlight section ${sectionId}: mesh not found`);
      return;
    }

    // Store original material if not already stored
    if (!this.originalMaterials.has(sectionId)) {
      const originalMaterial = mesh.material as THREE.Material;
      this.originalMaterials.set(sectionId, originalMaterial);
    }

    // Apply highlight material with smooth transition
    this.transitionMaterial(mesh, this.highlightMaterial, 250);
  }

  /**
   * Remove highlight from a section with smooth transition
   */
  dehighlightSection(sectionId: string): void {
    const mesh = this.meshMap.get(sectionId);
    if (!mesh) {
      console.warn(`Cannot dehighlight section ${sectionId}: mesh not found`);
      return;
    }

    const originalMaterial = this.originalMaterials.get(sectionId);
    if (originalMaterial) {
      this.transitionMaterial(mesh, originalMaterial, 250);
    } else {
      console.warn(
        `Cannot dehighlight section ${sectionId}: original material not found`
      );
    }
  }

  /**
   * Select a section
   */
  selectSection(sectionId: string): void {
    const mesh = this.meshMap.get(sectionId);
    if (!mesh) {
      console.warn(`Cannot select section ${sectionId}: mesh not found`);
      return;
    }

    // Store original material if not already stored
    if (!this.originalMaterials.has(sectionId)) {
      const originalMaterial = mesh.material as THREE.Material;
      this.originalMaterials.set(sectionId, originalMaterial);
    }

    // Apply selected material with smooth transition
    this.transitionMaterial(mesh, this.selectedMaterial, 200);
  }

  /**
   * Deselect a section
   */
  deselectSection(sectionId: string): void {
    const mesh = this.meshMap.get(sectionId);
    if (!mesh) {
      console.warn(`Cannot deselect section ${sectionId}: mesh not found`);
      return;
    }

    const originalMaterial = this.originalMaterials.get(sectionId);
    if (originalMaterial) {
      this.transitionMaterial(mesh, originalMaterial, 200);
    } else {
      console.warn(
        `Cannot deselect section ${sectionId}: original material not found`
      );
    }
  }

  /**
   * Smooth material transition with animation
   */
  private transitionMaterial(
    mesh: THREE.Mesh,
    targetMaterial: THREE.Material,
    duration: number = 200
  ): void {
    try {
      const currentMaterial = mesh.material as THREE.MeshStandardMaterial;
      const targetMat = targetMaterial as THREE.MeshStandardMaterial;

      // Immediate switch for non-matching material types
      if (!currentMaterial.color || !targetMat.color) {
        mesh.material = targetMaterial;
        return;
      }

      // Smooth color transition using animation frame
      const startColor = currentMaterial.color.clone();
      const startEmissive =
        currentMaterial.emissive?.clone() || new THREE.Color(0x000000);
      const startOpacity = currentMaterial.opacity || 1;
      const startEmissiveIntensity = currentMaterial.emissiveIntensity || 0;

      const targetColor = targetMat.color.clone();
      const targetEmissive =
        targetMat.emissive?.clone() || new THREE.Color(0x000000);
      const targetOpacity = targetMat.opacity || 1;
      const targetEmissiveIntensity = targetMat.emissiveIntensity || 0;

      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out-cubic)
        const eased = 1 - Math.pow(1 - progress, 3);

        // Interpolate colors
        currentMaterial.color.lerpColors(startColor, targetColor, eased);
        if (currentMaterial.emissive) {
          currentMaterial.emissive.lerpColors(
            startEmissive,
            targetEmissive,
            eased
          );
        }
        currentMaterial.opacity =
          startOpacity + (targetOpacity - startOpacity) * eased;
        currentMaterial.emissiveIntensity =
          startEmissiveIntensity +
          (targetEmissiveIntensity - startEmissiveIntensity) * eased;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final material is exact
          mesh.material = targetMaterial;
        }
      };

      animate();
    } catch (error) {
      console.error("Error during material transition:", error);
      // Fallback to immediate switch
      mesh.material = targetMaterial;
    }
  }

  /**
   * Fit camera to model bounds
   */
  fitCameraToModel(): void {
    const box = new THREE.Box3().setFromObject(this.modelGroup);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // Add some padding

    this.camera.position.set(center.x, center.y, center.z + cameraZ);
    this.camera.lookAt(center);
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Reset view to initial state
   */
  resetView(): void {
    this.fitCameraToModel();
  }

  /**
   * Disassemble model (expand parts)
   */
  disassembleModel(): void {
    // Implement explosion animation
    this.modelGroup.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        const direction = new THREE.Vector3()
          .subVectors(child.position, new THREE.Vector3())
          .normalize()
          .multiplyScalar(index + 1);

        child.position.add(direction);
      }
    });
  }

  /**
   * Reassemble model (collapse parts)
   */
  reassembleModel(): void {
    // Return parts to original positions
    this.modelGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.position.set(0, 0, 0);
      }
    });
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  /**
   * Zoom camera
   */
  zoom(factor: number): void {
    this.camera.position.multiplyScalar(factor);
    this.controls.update();
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Animation loop
   */
  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Dispose viewer and free resources
   */
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener("resize", this.onWindowResize);
    this.clearModel();
    this.controls.dispose();
    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
