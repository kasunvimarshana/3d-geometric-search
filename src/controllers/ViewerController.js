/**
 * Viewer Controller - Manages 3D scene rendering and interactions
 * Following Single Responsibility Principle
 *
 * Enhanced with comprehensive event emission for all model lifecycle changes
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA_DEFAULTS, RENDERER_CONFIG, COLORS, EVENTS } from '../domain/constants.js';

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

    // Enhanced features
    this.focusMode = false;
    this.focusedObject = null;
    this.savedCameraState = null;
    this.cameraPresets = this.initializeCameraPresets();

    // Click handling and raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedObject = null;
    this.meshToSectionMap = new Map(); // Maps mesh UUID to section ID

    this.initialize();
  }

  /**
   * Initialize camera presets
   */
  initializeCameraPresets() {
    return {
      front: { position: [0, 0, 15], target: [0, 0, 0] },
      back: { position: [0, 0, -15], target: [0, 0, 0] },
      top: { position: [0, 15, 0], target: [0, 0, 0] },
      bottom: { position: [0, -15, 0], target: [0, 0, 0] },
      left: { position: [-15, 0, 0], target: [0, 0, 0] },
      right: { position: [15, 0, 0], target: [0, 0, 0] },
      isometric: { position: [10, 10, 10], target: [0, 0, 0] },
    };
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

    // Setup click handling for model interactions
    this.setupClickHandling();

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
   * Setup click handling for model interactions
   */
  setupClickHandling() {
    this.canvas.addEventListener('click', event => this.handleCanvasClick(event));
    this.canvas.addEventListener('mousemove', event => this.handleCanvasMouseMove(event));
  }

  /**
   * Handle canvas click events
   */
  handleCanvasClick(event) {
    // Prevent interaction if no model is loaded
    if (!this.currentModel) return;

    // Calculate normalized device coordinates
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Find intersections with model
    const intersects = this.raycaster.intersectObject(this.currentModel, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const intersectedPoint = intersects[0].point;

      // Get section ID from mesh
      const sectionId = this.getMeshSectionId(intersectedObject);

      // Emit MODEL_CLICKED event with detailed information
      this.eventBus.emit(EVENTS.MODEL_CLICKED, {
        mesh: intersectedObject,
        meshName: intersectedObject.name,
        meshUUID: intersectedObject.uuid,
        sectionId: sectionId,
        point: intersectedPoint.toArray(),
        distance: intersects[0].distance,
        timestamp: Date.now(),
      });

      // Update selected object
      this.selectedObject = intersectedObject;

      // Emit OBJECT_SELECTED event
      this.eventBus.emit(EVENTS.OBJECT_SELECTED, {
        object: intersectedObject,
        sectionId: sectionId,
        timestamp: Date.now(),
      });
    } else {
      // Clicked on empty space - deselect
      if (this.selectedObject) {
        this.eventBus.emit(EVENTS.OBJECT_DESELECTED, {
          timestamp: Date.now(),
        });
        this.selectedObject = null;
      }
    }
  }

  /**
   * Handle canvas mouse move for hover effects (future enhancement)
   */
  handleCanvasMouseMove(event) {
    // Placeholder for future hover highlighting
    // Can be implemented to show previews before clicking
  }

  /**
   * Get section ID for a given mesh
   */
  getMeshSectionId(mesh) {
    // First try direct mapping by UUID
    if (this.meshToSectionMap.has(mesh.uuid)) {
      return this.meshToSectionMap.get(mesh.uuid);
    }

    // Try mapping by name
    if (mesh.name) {
      for (const [uuid, sectionId] of this.meshToSectionMap.entries()) {
        const mappedMesh = this.currentModel.getObjectByProperty('uuid', uuid);
        if (mappedMesh && mappedMesh.name === mesh.name) {
          return sectionId;
        }
      }
    }

    // If no mapping found, return null
    return null;
  }

  /**
   * Update mesh-to-section mapping
   */
  updateMeshToSectionMap(sections) {
    this.meshToSectionMap.clear();

    if (!sections || sections.length === 0) return;

    // Build mapping from sections to meshes
    sections.forEach(section => {
      if (section.meshNames && section.meshNames.length > 0) {
        section.meshNames.forEach(meshName => {
          // Find mesh by name in current model
          if (this.currentModel) {
            this.currentModel.traverse(child => {
              if (child.isMesh && (child.name === meshName || child.uuid === meshName)) {
                this.meshToSectionMap.set(child.uuid, section.id);
              }
            });
          }
        });
      }
    });
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

    // Emit model updated event
    this.eventBus.emit(EVENTS.MODEL_UPDATED, {
      object3D: object,
      timestamp: Date.now(),
    });
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
    this.camera.position.set(center.x + distance, center.y + distance * 0.5, center.z + distance);

    // Update controls target
    this.controls.target.copy(center);
    this.controls.update();

    // Update state
    this.stateManager.setCameraPosition(this.camera.position);
    this.stateManager.setCameraTarget(center);

    // Emit camera position changed event
    this.eventBus.emit(EVENTS.CAMERA_POSITION_CHANGED, {
      position: this.camera.position.toArray(),
      target: center.toArray(),
      timestamp: Date.now(),
    });
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

      // Emit camera position changed event for default position
      this.eventBus.emit(EVENTS.CAMERA_POSITION_CHANGED, {
        position: [
          CAMERA_DEFAULTS.POSITION.x,
          CAMERA_DEFAULTS.POSITION.y,
          CAMERA_DEFAULTS.POSITION.z,
        ],
        target: [CAMERA_DEFAULTS.TARGET.x, CAMERA_DEFAULTS.TARGET.y, CAMERA_DEFAULTS.TARGET.z],
        timestamp: Date.now(),
      });
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

      // Emit model unload event
      this.eventBus.emit(EVENTS.MODEL_UNLOAD, {
        timestamp: Date.now(),
      });

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
   * Enable focus mode on specific object
   */
  enterFocusMode(object, sectionId = null) {
    if (!object) return;

    // Save current camera state
    this.savedCameraState = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
      zoom: this.camera.zoom,
    };

    // Hide all objects except focused one
    if (this.currentModel) {
      this.currentModel.traverse(child => {
        if (child.isMesh && child !== object) {
          child.visible = false;
        }
      });
    }

    // Focus camera on object
    this.focusOnObject(object);
    this.focusMode = true;
    this.focusedObject = object;

    // Emit focus mode entered event
    this.eventBus.emit(EVENTS.FOCUS_MODE_ENTERED, {
      object,
      sectionId,
      timestamp: Date.now(),
    });

    console.log('Entered focus mode');
  }

  /**
   * Exit focus mode
   */
  exitFocusMode() {
    if (!this.focusMode) return;

    // Restore visibility
    if (this.currentModel) {
      this.currentModel.traverse(child => {
        if (child.isMesh) {
          child.visible = true;
        }
      });
    }

    // Restore camera state
    if (this.savedCameraState) {
      this.camera.position.copy(this.savedCameraState.position);
      this.controls.target.copy(this.savedCameraState.target);
      this.camera.zoom = this.savedCameraState.zoom;
      this.camera.updateProjectionMatrix();
      this.controls.update();
    }

    this.focusMode = false;
    this.focusedObject = null;
    this.savedCameraState = null;

    // Emit focus mode exited event
    this.eventBus.emit(EVENTS.FOCUS_MODE_EXITED, {
      timestamp: Date.now(),
    });

    console.log('Exited focus mode');
  }

  /**
   * Set camera to preset view
   */
  setCameraPreset(presetName) {
    const preset = this.cameraPresets[presetName];
    if (!preset) {
      console.warn(`Camera preset '${presetName}' not found`);
      return;
    }

    // Get model center if available
    let center = new THREE.Vector3(0, 0, 0);
    if (this.currentModel) {
      const box = new THREE.Box3().setFromObject(this.currentModel);
      center = box.getCenter(new THREE.Vector3());
    }

    // Set camera position and target
    this.camera.position.set(
      center.x + preset.position[0],
      center.y + preset.position[1],
      center.z + preset.position[2]
    );
    this.controls.target.set(
      center.x + preset.target[0],
      center.y + preset.target[1],
      center.z + preset.target[2]
    );
    this.controls.update();

    // Emit camera preset changed event
    this.eventBus.emit(EVENTS.CAMERA_PRESET_CHANGED, {
      preset: presetName,
      position: this.camera.position.toArray(),
      target: this.controls.target.toArray(),
      timestamp: Date.now(),
    });

    console.log(`Camera preset '${presetName}' applied`);
  }

  /**
   * Frame object in view (fit to screen)
   */
  frameObject(object) {
    if (!object) {
      object = this.currentModel;
    }
    if (!object) return;

    this.focusOnObject(object);

    // Emit frame object event
    this.eventBus.emit(EVENTS.FRAME_OBJECT, {
      object,
      timestamp: Date.now(),
    });

    console.log('Object framed in view');
  }

  /**
   * Get current focus state
   */
  getFocusMode() {
    return this.focusMode;
  }

  /**
   * Toggle wireframe mode
   */
  toggleWireframe(enabled) {
    if (!this.currentModel) return;

    this.currentModel.traverse(child => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.wireframe = enabled;
          });
        } else {
          child.material.wireframe = enabled;
        }
      }
    });

    // Emit wireframe toggled event
    this.eventBus.emit(EVENTS.WIREFRAME_TOGGLED, {
      enabled,
      timestamp: Date.now(),
    });

    console.log(`Wireframe mode: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Toggle grid helper visibility
   */
  toggleGrid(visible) {
    const gridHelper = this.scene.children.find(child => child.type === 'GridHelper');
    if (gridHelper) {
      gridHelper.visible = visible;

      // Emit grid toggled event
      this.eventBus.emit(EVENTS.GRID_TOGGLED, {
        visible,
        timestamp: Date.now(),
      });

      console.log(`Grid: ${visible ? 'visible' : 'hidden'}`);
    }
  }

  /**
   * Toggle axes helper visibility
   */
  toggleAxes(visible) {
    const axesHelper = this.scene.children.find(child => child.type === 'AxesHelper');
    if (axesHelper) {
      axesHelper.visible = visible;

      // Emit axes toggled event
      this.eventBus.emit(EVENTS.AXES_TOGGLED, {
        visible,
        timestamp: Date.now(),
      });

      console.log(`Axes: ${visible ? 'visible' : 'hidden'}`);
    }
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
