/**
 * 3D Engine - Manages Three.js scene, renderer, and rendering loop
 * Separation of concerns: handles only rendering, not business logic
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Engine {
  constructor(container) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    this.meshMap = new Map(); // meshId -> THREE.Mesh
    this.initialized = false;
  }

  /**
   * Initialize the 3D engine
   */
  initialize() {
    if (this.initialized) {
      console.warn('Engine already initialized');
      return;
    }

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);

    // Create camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 100;

    // Setup lighting
    this.setupLighting();

    // Setup helpers
    this.setupHelpers();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));

    this.initialized = true;
  }

  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7.5);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    this.scene.add(dirLight1);

    // Additional directional light
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-5, 5, -5);
    this.scene.add(dirLight2);

    // Hemisphere light for better ambient lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    this.scene.add(hemiLight);
  }

  /**
   * Setup scene helpers (grid, axes)
   */
  setupHelpers() {
    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0xcccccc, 0xe0e0e0);
    gridHelper.name = 'gridHelper';
    this.scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.name = 'axesHelper';
    this.scene.add(axesHelper);
  }

  /**
   * Start rendering loop
   */
  start() {
    if (!this.initialized) {
      throw new Error('Engine not initialized');
    }

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Stop rendering loop
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Add mesh to scene
   */
  addMesh(meshId, geometry, material) {
    if (this.meshMap.has(meshId)) {
      console.warn(`Mesh ${meshId} already exists`);
      return;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.meshId = meshId;

    this.scene.add(mesh);
    this.meshMap.set(meshId, mesh);

    return mesh;
  }

  /**
   * Remove mesh from scene
   */
  removeMesh(meshId) {
    const mesh = this.meshMap.get(meshId);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => mat.dispose());
      } else {
        mesh.material.dispose();
      }
      this.meshMap.delete(meshId);
    }
  }

  /**
   * Get mesh by ID
   */
  getMesh(meshId) {
    return this.meshMap.get(meshId);
  }

  /**
   * Clear all meshes from scene
   */
  clearMeshes() {
    this.meshMap.forEach((mesh, meshId) => {
      this.removeMesh(meshId);
    });
    this.meshMap.clear();
  }

  /**
   * Fit camera to object
   */
  fitToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // Add some padding

    this.camera.position.set(center.x, center.y, center.z + cameraZ);
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Fit camera to entire scene
   */
  fitToScene() {
    const box = new THREE.Box3();
    this.meshMap.forEach((mesh) => {
      box.expandByObject(mesh);
    });

    if (box.isEmpty()) {
      return;
    }

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5;

    this.camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Reset camera to default position
   */
  resetCamera() {
    this.camera.position.set(5, 5, 5);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.initialized) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Enable/disable controls
   */
  setControlsEnabled(enabled) {
    if (this.controls) {
      this.controls.enabled = enabled;
    }
  }

  /**
   * Screenshot functionality
   */
  takeScreenshot() {
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.stop();
    this.clearMeshes();

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }

    window.removeEventListener('resize', this.handleResize.bind(this));

    this.initialized = false;
  }
}
