/**
 * Viewer Controller - Manages 3D scene rendering and interactions
 * Following Single Responsibility Principle
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_DEFAULTS, RENDERER_CONFIG, COLORS } from '../domain/constants.js';

export class ViewerController {
  constructor(canvas, eventBus, stateManager) {
    this.canvas = canvas;
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentModel = null;
    this.animationFrameId = null;

    this.initialize();
  }

  /**
   * Initialize Three.js scene
   */
  initialize() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.BACKGROUND);

    // Create camera
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_DEFAULTS.FOV,
      aspect,
      CAMERA_DEFAULTS.NEAR,
      CAMERA_DEFAULTS.FAR
    );
    this.camera.position.set(
      CAMERA_DEFAULTS.POSITION.x,
      CAMERA_DEFAULTS.POSITION.y,
      CAMERA_DEFAULTS.POSITION.z
    );

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: RENDERER_CONFIG.ANTIALIAS,
      alpha: RENDERER_CONFIG.ALPHA,
    });
    this.renderer.setPixelRatio(RENDERER_CONFIG.PIXEL_RATIO);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;
    this.controls.target.set(
      CAMERA_DEFAULTS.TARGET.x,
      CAMERA_DEFAULTS.TARGET.y,
      CAMERA_DEFAULTS.TARGET.z
    );

    // Add lights
    this.setupLights();

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    this.scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());

    // Start animation loop
    this.animate();
  }

  /**
   * Setup scene lighting
   */
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(COLORS.AMBIENT_LIGHT, 0.5);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(COLORS.DIRECTIONAL_LIGHT, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    // Additional fill light
    const fillLight = new THREE.DirectionalLight(COLORS.DIRECTIONAL_LIGHT, 0.3);
    fillLight.position.set(-10, 5, -10);
    this.scene.add(fillLight);
  }

  /**
   * Add a 3D model to the scene
   */
  addModel(object) {
    // Remove existing model
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }

    // Add new model
    this.currentModel = object;
    this.scene.add(object);

    // Focus camera on model
    this.focusOnObject(object);
  }

  /**
   * Focus camera on object
   */
  focusOnObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Calculate optimal camera distance
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

    // Set camera position
    const distance = cameraDistance * 1.5;
    this.camera.position.set(
      center.x + distance,
      center.y + distance * 0.5,
      center.z + distance
    );

    // Update controls target
    this.controls.target.copy(center);
    this.controls.update();

    // Update state
    this.stateManager.setCameraPosition(this.camera.position);
    this.stateManager.setCameraTarget(center);
  }

  /**
   * Reset camera view
   */
  resetView() {
    if (this.currentModel) {
      this.focusOnObject(this.currentModel);
    } else {
      this.camera.position.set(
        CAMERA_DEFAULTS.POSITION.x,
        CAMERA_DEFAULTS.POSITION.y,
        CAMERA_DEFAULTS.POSITION.z
      );
      this.controls.target.set(
        CAMERA_DEFAULTS.TARGET.x,
        CAMERA_DEFAULTS.TARGET.y,
        CAMERA_DEFAULTS.TARGET.z
      );
      this.controls.update();
    }

    this.stateManager.setZoom(100);
  }

  /**
   * Set zoom level
   */
  setZoom(zoomPercent) {
    const zoomFactor = zoomPercent / 100;
    this.camera.zoom = zoomFactor;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Update controls
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Remove current model from scene
   */
  removeModel() {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel = null;
    }
  }

  /**
   * Get current model
   */
  getCurrentModel() {
    return this.currentModel;
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.currentModel) {
      this.removeModel();
    }

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    window.removeEventListener('resize', () => this.handleResize());
  }
}
