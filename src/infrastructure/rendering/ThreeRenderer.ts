import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Model } from "@core/entities/Model";
import { IRenderer } from "@core/interfaces/repositories";
import { UUID } from "@shared/types/interfaces";
import { ViewMode } from "@shared/types/enums";
import { VIEWER_CONFIG, VISUAL_CONFIG } from "@shared/constants";

/**
 * Three.js-based 3D renderer implementation
 * Follows Dependency Inversion Principle - implements IRenderer interface
 */
export class ThreeRenderer implements IRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private container?: HTMLElement;
  private animationFrameId?: number;

  // Model objects
  private modelGroup: THREE.Group;
  private sectionMeshes: Map<UUID, THREE.Object3D> = new Map();
  private selectedMeshes: Set<UUID> = new Set();
  private highlightedMesh?: UUID;

  // Helpers
  private grid?: THREE.GridHelper;
  private axes?: THREE.AxesHelper;

  // Materials
  private originalMaterials: Map<UUID, THREE.Material | THREE.Material[]> =
    new Map();
  private selectionMaterial: THREE.MeshStandardMaterial;
  private hoverMaterial: THREE.MeshStandardMaterial;

  constructor() {
    // Initialize scene
    this.scene = new THREE.Scene();
    const bgColor = VISUAL_CONFIG.DEFAULT_BACKGROUND;
    this.scene.background = new THREE.Color(bgColor.r, bgColor.g, bgColor.b);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      VIEWER_CONFIG.DEFAULT_FOV,
      1,
      VIEWER_CONFIG.NEAR_PLANE,
      VIEWER_CONFIG.FAR_PLANE
    );
    this.camera.position.set(50, 50, 50);
    this.camera.lookAt(0, 0, 0);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = VIEWER_CONFIG.CAMERA_DAMPING;
    this.controls.screenSpacePanning = true;

    // Initialize model group
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // Setup lighting
    this.setupLighting();

    // Create materials
    const selColor = VISUAL_CONFIG.SELECTION_COLOR;
    this.selectionMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selColor.r, selColor.g, selColor.b),
      transparent: true,
      opacity: 0.8,
      metalness: 0.5,
      roughness: 0.5,
    });

    const hoverColor = VISUAL_CONFIG.HOVER_COLOR;
    this.hoverMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hoverColor.r, hoverColor.g, hoverColor.b),
      transparent: true,
      opacity: 0.6,
      metalness: 0.3,
      roughness: 0.7,
    });
  }

  /**
   * Initialize the renderer with a container
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    container.appendChild(this.renderer.domElement);
    this.resize(container.clientWidth, container.clientHeight);
    this.startRenderLoop();
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls.dispose();
    this.renderer.dispose();
    this.scene.clear();
    this.sectionMeshes.clear();
    this.originalMaterials.clear();
  }

  /**
   * Render a single frame
   */
  render(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Load a model into the scene
   */
  async loadModel(model: Model): Promise<void> {
    // Clear existing model
    this.unloadModel();

    // Create meshes for each section
    model.getAllSections().forEach((section) => {
      const sectionGroup = new THREE.Group();
      sectionGroup.name = section.name;
      sectionGroup.userData.sectionId = section.id;

      // Add geometries
      section.geometryIds.forEach((geomId) => {
        const geometry = model.getGeometry(geomId);
        if (!geometry) return;

        // Create a simple mesh (in real implementation, convert actual geometry)
        const mesh = this.createMeshFromGeometry(geometry);
        if (mesh) {
          sectionGroup.add(mesh);
        }
      });

      this.sectionMeshes.set(section.id, sectionGroup);
      this.modelGroup.add(sectionGroup);
    });

    // Fit camera to model
    this.fitToScreen();
  }

  /**
   * Unload the current model
   */
  unloadModel(): void {
    this.modelGroup.clear();
    this.sectionMeshes.clear();
    this.selectedMeshes.clear();
    this.originalMaterials.clear();
    this.highlightedMesh = undefined;
  }

  /**
   * Select sections
   */
  selectSections(sectionIds: UUID[]): void {
    // Reset previous selections
    this.selectedMeshes.forEach((id) => {
      this.resetMaterial(id);
    });
    this.selectedMeshes.clear();

    // Apply selection to new sections
    sectionIds.forEach((id) => {
      const mesh = this.sectionMeshes.get(id);
      if (mesh) {
        this.applyMaterial(mesh, this.selectionMaterial, id);
        this.selectedMeshes.add(id);
      }
    });
  }

  /**
   * Highlight a section on hover
   */
  highlightSection(sectionId: UUID | null): void {
    // Remove previous highlight
    if (
      this.highlightedMesh &&
      !this.selectedMeshes.has(this.highlightedMesh)
    ) {
      this.resetMaterial(this.highlightedMesh);
    }

    // Apply new highlight
    if (sectionId) {
      const mesh = this.sectionMeshes.get(sectionId);
      if (mesh && !this.selectedMeshes.has(sectionId)) {
        this.applyMaterial(mesh, this.hoverMaterial, sectionId);
        this.highlightedMesh = sectionId;
      }
    }
  }

  /**
   * Isolate sections
   */
  isolateSections(sectionIds: UUID[]): void {
    const isolatedSet = new Set(sectionIds);

    this.sectionMeshes.forEach((mesh, id) => {
      mesh.visible = isolatedSet.has(id);
    });
  }

  /**
   * Set section visibility
   */
  setSectionVisibility(sectionId: UUID, visible: boolean): void {
    const mesh = this.sectionMeshes.get(sectionId);
    if (mesh) {
      mesh.visible = visible;
    }
  }

  /**
   * Reset camera to default view
   */
  resetCamera(): void {
    this.camera.position.set(50, 50, 50);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * Fit all visible objects to screen
   */
  fitToScreen(): void {
    const box = new THREE.Box3();

    this.modelGroup.children.forEach((child) => {
      if (child.visible) {
        box.expandByObject(child);
      }
    });

    if (box.isEmpty()) return;

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
   * Set view mode
   */
  setViewMode(mode: string): void {
    this.modelGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        switch (mode) {
          case ViewMode.WIREFRAME:
            obj.material = new THREE.MeshBasicMaterial({
              color: 0x000000,
              wireframe: true,
            });
            break;
          case ViewMode.SHADED:
            // Reset to original or default material
            break;
          case ViewMode.TRANSPARENT:
            if (obj.material instanceof THREE.Material) {
              obj.material.transparent = true;
              obj.material.opacity = 0.5;
            }
            break;
        }
      }
    });
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);

    // Directional lights
    const light1 = new THREE.DirectionalLight(0xffffff, 0.6);
    light1.position.set(50, 100, 50);
    light1.castShadow = true;
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.3);
    light2.position.set(-50, 50, -50);
    this.scene.add(light2);
  }

  /**
   * Create mesh from geometry data
   */
  private createMeshFromGeometry(geometry: any): THREE.Mesh | null {
    // In real implementation, convert actual geometry data to Three.js geometry
    // For now, create a simple box as placeholder
    const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.3,
      roughness: 0.7,
    });
    return new THREE.Mesh(boxGeometry, material);
  }

  /**
   * Apply material to mesh
   */
  private applyMaterial(
    obj: THREE.Object3D,
    material: THREE.Material,
    id: UUID
  ): void {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!this.originalMaterials.has(id)) {
          this.originalMaterials.set(id, child.material);
        }
        child.material = material;
      }
    });
  }

  /**
   * Reset material to original
   */
  private resetMaterial(id: UUID): void {
    const mesh = this.sectionMeshes.get(id);
    const originalMaterial = this.originalMaterials.get(id);

    if (mesh && originalMaterial) {
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = originalMaterial;
        }
      });
      this.originalMaterials.delete(id);
    }
  }

  /**
   * Start render loop
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.render();
    };
    animate();
  }
}
