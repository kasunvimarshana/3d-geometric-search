/**
 * 3D Viewer - Manages the Three.js 3D viewport
 * Enhanced with advanced lighting, shadows, and control options
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Config from "./config.js";

// Get EventHandlerManager from global scope
const EventHandlerManager = window.EventHandlerManager;

export class Viewer3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentModel = null;
    this.wireframeMode = false;
    this.lights = {};
    this.helpers = {};
    this.animationId = null;
    this.autoRotate = false;
    this.isFullscreen = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.originalMaterials = new Map();
    this.settings = {
      showGrid: true,
      showAxes: Config.debug.showAxesHelper,
      enableShadows: Config.viewer.enableShadows,
      ambientIntensity: Config.lighting.ambient.intensity,
      directionalIntensity: Config.lighting.directional.intensity,
      modelScale: 1.0,
      autoRotateSpeed: 0.5,
    };

    // Initialize event manager for proper event handling
    this.eventManager = new EventHandlerManager();

    this.init();
  }

  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(Config.viewer.backgroundColor);

    // Create camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const cfg = Config.viewer;
    this.camera = new THREE.PerspectiveCamera(
      cfg.cameraFov,
      aspect,
      cfg.cameraNear,
      cfg.cameraFar
    );
    const camPos = cfg.defaultCameraPosition;
    this.camera.position.set(camPos.x, camPos.y, camPos.z);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: cfg.antialias,
      preserveDrawingBuffer: true, // Enable screenshots
    });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Enable shadows if configured
    if (this.settings.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.container.appendChild(this.renderer.domElement);

    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 2.0;

    // Add lights
    this.addLights();

    // Add grid helper
    this.helpers.grid = new THREE.GridHelper(
      Config.viewer.gridSize,
      Config.viewer.gridDivisions,
      0x444444,
      0x222222
    );
    this.scene.add(this.helpers.grid);

    // Add axes helper (optional)
    if (this.settings.showAxes) {
      this.helpers.axes = new THREE.AxesHelper(5);
      this.scene.add(this.helpers.axes);
    }

    // Setup event listeners with proper tracking
    this._setupEventListeners();

    // Start animation loop
    this.animate();
  }

  /**
   * Create a throttled handler with consistent error handling
   * @param {Function} func - Function to throttle
   * @param {number} delay - Throttle delay in ms
   * @param {string} context - Context for error logging
   * @returns {Function} Throttled function
   * @private
   */
  _createThrottleHandler(func, delay, context = "handler") {
    let throttleTimer = null;
    return (...args) => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          try {
            func.apply(this, args);
          } catch (error) {
            console.error(`[Viewer] Error in ${context}:`, error);
          }
          throttleTimer = null;
        }, delay);
      }
    };
  }

  /**
   * Create a safe handler wrapper with error handling
   * @param {Function} func - Function to wrap
   * @param {string} context - Context for error logging
   * @returns {Function} Wrapped function
   * @private
   */
  _createSafeHandler(func, context = "handler") {
    return (...args) => {
      try {
        return func.apply(this, args);
      } catch (error) {
        console.error(`[Viewer] Error in ${context}:`, error);
      }
    };
  }

  /**
   * Setup all event listeners with proper tracking
   * @private
   */
  _setupEventListeners() {
    // Handle window resize (throttled for performance)
    this.eventManager.add(
      window,
      "resize",
      this._createThrottleHandler(
        () => this.onWindowResize(),
        250,
        "resize handler"
      )
    );

    // Handle fullscreen change (all vendor prefixes)
    const fullscreenHandler = this._createSafeHandler(
      () => this.onFullscreenChange(),
      "fullscreen handler"
    );

    this.eventManager.add(document, "fullscreenchange", fullscreenHandler);
    this.eventManager.add(
      document,
      "webkitfullscreenchange",
      fullscreenHandler
    );
    this.eventManager.add(document, "mozfullscreenchange", fullscreenHandler);
    this.eventManager.add(document, "MSFullscreenChange", fullscreenHandler);

    // Double-click to focus on model
    this.renderer.domElement.addEventListener("dblclick", () => {
      if (this.currentModel) {
        this.focusOnModel();
      }
    });

    // Add mouse interaction for model clicking
    this.renderer.domElement.addEventListener("click", (event) => {
      this.handleModelClick(event);
    });

    this.renderer.domElement.addEventListener("mousemove", (event) => {
      this.handleMouseMove(event);
    });

    // Start animation loop
    this.animate();
  }

  /**
   * Handle mouse movement for highlighting
   */
  handleMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.currentModel) {
      const intersects = this.raycaster.intersectObject(
        this.currentModel,
        true
      );

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (this.hoveredObject !== object) {
          this.restoreHoveredObject();
          this.hoveredObject = object;
          this.highlightObject(object);
        }
        this.renderer.domElement.style.cursor = "pointer";
      } else {
        this.restoreHoveredObject();
        this.hoveredObject = null;
        this.renderer.domElement.style.cursor = "default";
      }
    }
  }

  /**
   * Handle click on model
   */
  handleModelClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.currentModel) {
      const intersects = this.raycaster.intersectObject(
        this.currentModel,
        true
      );

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        // Emit custom event for the app to handle
        const clickEvent = new CustomEvent("modelSectionClick", {
          detail: {
            object: clickedObject,
            point: intersects[0].point,
            modelName: this.currentModel.userData.modelName,
          },
        });
        this.container.dispatchEvent(clickEvent);
      }
    }
  }

  /**
   * Highlight an object when hovered
   */
  highlightObject(object) {
    if (object.isMesh && !object.userData.isHighlighted) {
      // Store original material
      object.userData.originalMaterial = object.material;
      object.userData.isHighlighted = true;

      // Create highlight material using config colors
      const highlightMaterial = object.material.clone();
      if (highlightMaterial.emissive) {
        highlightMaterial.emissive.setHex(
          Config.viewer.highlightColor || 0x0284c7
        );
        highlightMaterial.emissiveIntensity =
          Config.viewer.highlightIntensity || 0.3;
      }
      object.material = highlightMaterial;
    }
  }

  /**
   * Restore the previously hovered object
   */
  restoreHoveredObject() {
    if (this.hoveredObject && this.hoveredObject.userData.isHighlighted) {
      if (this.hoveredObject.userData.originalMaterial) {
        this.hoveredObject.material =
          this.hoveredObject.userData.originalMaterial;
      }
      this.hoveredObject.userData.isHighlighted = false;
    }
  }

  addLights() {
    const lightCfg = Config.lighting;

    // Ambient light
    this.lights.ambient = new THREE.AmbientLight(
      lightCfg.ambient.color,
      lightCfg.ambient.intensity
    );
    this.scene.add(this.lights.ambient);

    // Directional light (main light)
    this.lights.directional = new THREE.DirectionalLight(
      lightCfg.directional.color,
      lightCfg.directional.intensity
    );
    const dirPos = lightCfg.directional.position;
    this.lights.directional.position.set(dirPos.x, dirPos.y, dirPos.z);

    if (this.settings.enableShadows && lightCfg.directional.castShadow) {
      this.lights.directional.castShadow = true;
      this.lights.directional.shadow.mapSize.width =
        Config.viewer.shadowMapSize;
      this.lights.directional.shadow.mapSize.height =
        Config.viewer.shadowMapSize;
      this.lights.directional.shadow.camera.near = 0.5;
      this.lights.directional.shadow.camera.far = 500;
      this.lights.directional.shadow.camera.left = -10;
      this.lights.directional.shadow.camera.right = 10;
      this.lights.directional.shadow.camera.top = 10;
      this.lights.directional.shadow.camera.bottom = -10;
    }

    this.scene.add(this.lights.directional);

    // Hemisphere light for better illumination
    this.lights.hemisphere = new THREE.HemisphereLight(
      lightCfg.hemisphere.skyColor,
      lightCfg.hemisphere.groundColor,
      lightCfg.hemisphere.intensity
    );
    this.scene.add(this.lights.hemisphere);

    // Optional spotlight
    if (lightCfg.spotlight && lightCfg.spotlight.intensity > 0) {
      this.lights.spotlight = new THREE.SpotLight(
        lightCfg.spotlight.color,
        lightCfg.spotlight.intensity
      );
      const spotPos = lightCfg.spotlight.position;
      this.lights.spotlight.position.set(spotPos.x, spotPos.y, spotPos.z);
      this.lights.spotlight.castShadow =
        lightCfg.spotlight.castShadow && this.settings.enableShadows;
      this.scene.add(this.lights.spotlight);
    }
  }

  loadModel(object) {
    // Remove previous model
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
    }

    // Add new model
    this.currentModel = object;

    // Enable shadows on model if configured
    if (this.settings.enableShadows) {
      this.currentModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    this.scene.add(this.currentModel);

    // Center and scale model
    this.centerAndScaleModel(this.currentModel);

    // Reset camera
    this.resetView();

    // Clear any hover state
    this.restoreHoveredObject();
    this.hoveredObject = null;
  }

  centerAndScaleModel(object) {
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center model
    object.position.sub(center);

    // Scale model to fit in view
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim; // Target size of 3 units
    object.scale.setScalar(scale);

    // Update controls target
    this.controls.target.set(0, 0, 0);
  }

  /**
   * Reset view to default camera position and clear all selections
   * Triggered by 'R' key - comprehensive workspace reset
   */
  resetView() {
    // Clear any active selections first
    this.deselectObject();
    if (this.hoveredObject) {
      this.unhighlightObject(this.hoveredObject);
      this.hoveredObject = null;
    }

    // Reset controls target to origin
    this.controls.target.set(0, 0, 0);

    // Reset camera to default position
    const camPos = Config.viewer.defaultCameraPosition;
    this.camera.position.set(camPos.x, camPos.y, camPos.z);
    this.camera.lookAt(0, 0, 0);

    // Update controls smoothly
    this.controls.update();

    // If model exists, ensure it's centered and properly scaled
    if (this.currentModel) {
      // Reset model position to origin
      this.currentModel.position.set(0, 0, 0);

      // Reset model rotation
      this.currentModel.rotation.set(0, 0, 0);

      // Ensure model scale is at default
      if (this.settings.modelScale !== 1.0) {
        this.currentModel.scale.setScalar(1.0);
        this.settings.modelScale = 1.0;
      }
    }

    // Emit event for UI synchronization (hierarchy panel, etc.)
    if (this.eventBus) {
      this.eventBus.emit("viewer:view-reset", {
        cameraPosition: { x: camPos.x, y: camPos.y, z: camPos.z },
        controlsTarget: { x: 0, y: 0, z: 0 },
        timestamp: Date.now(),
      });
    }

    // Dispatch custom event for legacy support
    this.container.dispatchEvent(
      new CustomEvent("viewReset", {
        detail: {
          cameraPosition: this.camera.position.clone(),
          controlsTarget: this.controls.target.clone(),
        },
      })
    );

    console.log("[Viewer] View reset to default state");
  }

  /**
   * Reset all viewer settings to default state
   * Includes camera, zoom, rotation, display options, and scale
   * Triggered by Shift+R or Reset All button
   */
  resetAll() {
    // Reset camera position and clear selections (uses enhanced resetView)
    this.resetView();

    // Reset auto-rotation
    if (this.autoRotate) {
      this.autoRotate = false;
      this.controls.autoRotate = false;
    }

    // Reset wireframe mode
    if (this.wireframeMode) {
      this.toggleWireframe();
    }

    // Reset all settings to default
    this.settings = {
      showGrid: true,
      showAxes: Config.debug.showAxesHelper,
      enableShadows: Config.viewer.enableShadows,
      ambientIntensity: Config.lighting.ambient.intensity,
      directionalIntensity: Config.lighting.directional.intensity,
      modelScale: 1.0,
      autoRotateSpeed: 0.5,
    };

    // Apply settings to scene
    if (this.helpers.grid) {
      this.helpers.grid.visible = this.settings.showGrid;
    }
    if (this.helpers.axes) {
      this.helpers.axes.visible = this.settings.showAxes;
    }

    // Reset shadows
    this.renderer.shadowMap.enabled = this.settings.enableShadows;
    if (this.lights.directional) {
      this.lights.directional.castShadow = this.settings.enableShadows;
    }

    // Reset lighting
    if (this.lights.ambient) {
      this.lights.ambient.intensity = this.settings.ambientIntensity;
    }
    if (this.lights.directional) {
      this.lights.directional.intensity = this.settings.directionalIntensity;
    }

    // Exit fullscreen if active
    if (this.isFullscreen) {
      this.toggleFullscreen();
    }

    // Emit comprehensive reset event
    if (this.eventBus) {
      this.eventBus.emit("viewer:reset-all", {
        settings: this.settings,
        timestamp: Date.now(),
      });
    }

    // Dispatch event for UI update (legacy support)
    this.container.dispatchEvent(
      new CustomEvent("resetAll", {
        detail: { settings: this.settings },
      })
    );

    console.log("[Viewer] All settings reset to default");
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;

    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child.isMesh) {
          if (this.wireframeMode) {
            // Store original material
            child.userData.originalMaterial = child.material;
            // Apply wireframe material
            child.material = new THREE.MeshBasicMaterial({
              color: 0x00ff00,
              wireframe: true,
            });
          } else {
            // Restore original material
            if (child.userData.originalMaterial) {
              child.material = child.userData.originalMaterial;
            }
          }
        }
      });
    }
  }

  /**
   * Toggle grid visibility
   */
  toggleGrid() {
    this.settings.showGrid = !this.settings.showGrid;
    if (this.helpers.grid) {
      this.helpers.grid.visible = this.settings.showGrid;
    }
  }

  /**
   * Toggle axes helper
   */
  toggleAxes() {
    this.settings.showAxes = !this.settings.showAxes;

    if (this.settings.showAxes && !this.helpers.axes) {
      this.helpers.axes = new THREE.AxesHelper(5);
      this.scene.add(this.helpers.axes);
    } else if (this.helpers.axes) {
      this.helpers.axes.visible = this.settings.showAxes;
    }
  }

  /**
   * Adjust ambient light intensity
   * @param {number} intensity - Light intensity (0-1)
   */
  setAmbientIntensity(intensity) {
    this.settings.ambientIntensity = intensity;
    if (this.lights.ambient) {
      this.lights.ambient.intensity = intensity;
    }
  }

  /**
   * Adjust directional light intensity
   * @param {number} intensity - Light intensity (0-2)
   */
  setDirectionalIntensity(intensity) {
    this.settings.directionalIntensity = intensity;
    if (this.lights.directional) {
      this.lights.directional.intensity = intensity;
    }
  }

  /**
   * Change background color
   * @param {number} color - Hex color value
   */
  setBackgroundColor(color) {
    this.scene.background = new THREE.Color(color);
  }

  /**
   * Toggle shadow rendering
   */
  toggleShadows() {
    this.settings.enableShadows = !this.settings.enableShadows;
    this.renderer.shadowMap.enabled = this.settings.enableShadows;

    // Update lights
    if (this.lights.directional) {
      this.lights.directional.castShadow = this.settings.enableShadows;
    }
    if (this.lights.spotlight) {
      this.lights.spotlight.castShadow = this.settings.enableShadows;
    }

    // Update model shadows
    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = this.settings.enableShadows;
          child.receiveShadow = this.settings.enableShadows;
        }
      });
    }
  }

  /**
   * Take a screenshot of current view
   * @returns {string} Data URL of screenshot
   */
  takeScreenshot() {
    return this.renderer.domElement.toDataURL("image/png");
  }

  /**
   * Zoom in the camera view
   */
  zoomIn() {
    const currentDistance = this.camera.position.distanceTo(
      this.controls.target
    );
    const newDistance = Math.max(
      currentDistance * 0.8,
      this.controls.minDistance
    );
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();
    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(direction, newDistance);
    this.controls.update();

    // Emit zoom event for highlight persistence
    if (this.eventBus) {
      this.eventBus.emit("viewer:zoom-changed", {
        direction: "in",
        distance: newDistance,
        selectedObject: this.selectedObject,
        isolated: this.isolatedObject !== null,
        timestamp: Date.now(),
      });
    }

    // Maintain highlight on selected object (isolation is already active)
    if (this.selectedObject) {
      this.highlightObject(this.selectedObject, 0xffaa00, 0.8);
    }
  }

  /**
   * Zoom out the camera view
   */
  zoomOut() {
    const currentDistance = this.camera.position.distanceTo(
      this.controls.target
    );
    const newDistance = Math.min(
      currentDistance * 1.25,
      this.controls.maxDistance
    );
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();
    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(direction, newDistance);
    this.controls.update();

    // Emit zoom event for highlight persistence
    if (this.eventBus) {
      this.eventBus.emit("viewer:zoom-changed", {
        direction: "out",
        distance: newDistance,
        selectedObject: this.selectedObject,
        isolated: this.isolatedObject !== null,
        timestamp: Date.now(),
      });
    }

    // Maintain highlight on selected object (isolation is already active)
    if (this.selectedObject) {
      this.highlightObject(this.selectedObject, 0xffaa00, 0.8);
    }
  }

  /**
   * Reset zoom to default view distance
   */
  resetZoom() {
    const camPos = Config.viewer.defaultCameraPosition;
    const defaultDistance = Math.sqrt(
      camPos.x ** 2 + camPos.y ** 2 + camPos.z ** 2
    );
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();
    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(direction, defaultDistance);
    this.controls.update();
  }

  /**
   * Get current zoom level as percentage
   * @returns {number} Zoom level (0-100)
   */
  getZoomLevel() {
    const currentDistance = this.camera.position.distanceTo(
      this.controls.target
    );
    const range = this.controls.maxDistance - this.controls.minDistance;
    const normalizedDistance =
      (currentDistance - this.controls.minDistance) / range;
    return Math.round((1 - normalizedDistance) * 100);
  }

  /**
   * Fit camera to view the current model optimally
   * Ensures entire model is visible with proper framing
   */
  fitToView() {
    if (!this.currentModel) {
      console.warn("[Viewer] No model to fit to view");
      return;
    }

    try {
      // Calculate model bounding box
      const box = new THREE.Box3().setFromObject(this.currentModel);

      // Verify valid bounds
      if (box.isEmpty()) {
        console.warn("[Viewer] Model has empty bounding box");
        return;
      }

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Calculate optimal camera distance based on model size
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

      // Update controls target to model center
      this.controls.target.copy(center);

      // Position camera at optimal distance
      const direction = new THREE.Vector3()
        .subVectors(this.camera.position, center)
        .normalize();
      this.camera.position
        .copy(center)
        .addScaledVector(direction, cameraDistance);

      // Smooth update
      this.controls.update();

      console.log("[Viewer] Fitted model to view");
    } catch (error) {
      console.error("[Viewer] Error fitting to view:", error);
    }
  }

  /**
   * Set camera to preset view
   * @param {string} view - View name: 'front', 'back', 'left', 'right', 'top', 'bottom'
   */
  setCameraView(view) {
    const distance = this.camera.position.distanceTo(this.controls.target);
    const target = this.controls.target.clone();

    const positions = {
      front: new THREE.Vector3(0, 0, distance),
      back: new THREE.Vector3(0, 0, -distance),
      left: new THREE.Vector3(-distance, 0, 0),
      right: new THREE.Vector3(distance, 0, 0),
      top: new THREE.Vector3(0, distance, 0),
      bottom: new THREE.Vector3(0, -distance, 0),
    };

    if (positions[view]) {
      this.camera.position.copy(target).add(positions[view]);
      this.camera.up.set(0, 1, 0);

      // Special handling for top/bottom views
      if (view === "bottom") {
        this.camera.up.set(0, -1, 0);
      }

      this.camera.lookAt(target);
      this.controls.update();
    }
  }

  /**
   * Toggle auto-rotation
   */
  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    this.controls.autoRotate = this.autoRotate;
    return this.autoRotate;
  }

  /**
   * Set auto-rotation speed
   * @param {number} speed - Rotation speed
   */
  setAutoRotateSpeed(speed) {
    this.settings.autoRotateSpeed = speed;
    this.controls.autoRotateSpeed = speed;
  }

  /**
   * Scale the current model
   * @param {number} scale - Scale factor
   */
  scaleModel(scale) {
    if (!this.currentModel) return;

    this.settings.modelScale = scale;

    // Recalculate the scale based on original model size
    const box = new THREE.Box3().setFromObject(this.currentModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) / this.currentModel.scale.x; // Get original size
    const baseScale = 3 / maxDim;

    this.currentModel.scale.setScalar(baseScale * scale);
  }

  /**
   * Focus camera on current model with smooth transition
   * Ensures optimal view of the model from all angles
   */
  focusOnModel() {
    if (!this.currentModel) {
      console.warn("[Viewer] No model to focus on");
      return;
    }

    try {
      // Calculate model bounds
      const box = new THREE.Box3().setFromObject(this.currentModel);

      // Verify valid bounding box
      if (box.isEmpty()) {
        console.warn("[Viewer] Model has empty bounding box");
        return;
      }

      const center = box.getCenter(new THREE.Vector3());

      // Update controls target to model center
      this.controls.target.copy(center);

      // Fit model to view for optimal visibility
      this.fitToView();

      // Smooth update of controls
      this.controls.update();

      // Emit focus event for hierarchy integration
      if (this.eventBus) {
        this.eventBus.emit("viewer:focus-on-model", {
          model: this.currentModel,
          timestamp: Date.now(),
        });
      }

      console.log("[Viewer] Focused on model");
    } catch (error) {
      console.error("[Viewer] Error focusing on model:", error);
    }
  }

  /**
   * Focus camera on specific object (mesh or group)
   * Used for focusing on individual model sections
   */
  focusOnObject(object) {
    if (!object) {
      console.warn("[Viewer] No object to focus on");
      return;
    }

    try {
      // Calculate object bounds
      const box = new THREE.Box3().setFromObject(object);

      if (box.isEmpty()) {
        console.warn("[Viewer] Object has empty bounding box");
        return;
      }

      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // Calculate camera distance
      const fov = this.camera.fov * (Math.PI / 180);
      let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));
      cameraDistance *= 1.5; // Add padding

      // Update controls target
      this.controls.target.copy(center);

      // Move camera to new position
      const direction = new THREE.Vector3();
      this.camera.getWorldDirection(direction);
      direction.multiplyScalar(-cameraDistance);

      const newPosition = center.clone().add(direction);
      this.camera.position.copy(newPosition);

      // Update controls
      this.controls.update();

      // Select the object if it's a mesh
      if (object.isMesh) {
        this.selectObject(object);
      }

      console.log("[Viewer] Focused on object:", object.name || object.type);
    } catch (error) {
      console.error("[Viewer] Error focusing on object:", error);
    }
  }

  /**
   * Handle mouse click on 3D models
   */
  onModelClick(event) {
    if (!this.interactionEnabled || !this.currentModel) return;

    this.updateMousePosition(event);
    const intersects = this.getIntersections();

    if (intersects.length > 0) {
      const object = intersects[0].object;
      const point = intersects[0].point;

      // Toggle selection with improved state management
      if (this.selectedObject === object) {
        console.log(
          "[Viewer] Toggling off selection:",
          object.name || object.type
        );
        this.deselectObject();
      } else {
        console.log("[Viewer] Selecting object:", object.name || object.type);
        this.selectObject(object, point);
      }

      // Dispatch custom event with complete data
      this.container.dispatchEvent(
        new CustomEvent("modelClick", {
          detail: {
            object: object,
            point: point,
            intersection: intersects[0],
            isSelected: this.selectedObject === object,
          },
        })
      );
    } else {
      // Click on empty space - deselect
      if (this.selectedObject) {
        console.log("[Viewer] Click on empty space - deselecting");
        this.deselectObject();
      }
    }
  }

  /**
   * Handle mouse hover over 3D models
   */
  onModelHover(event) {
    if (!this.interactionEnabled || !this.currentModel) return;

    this.updateMousePosition(event);
    const intersects = this.getIntersections();

    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (this.hoveredObject !== object) {
        // Remove previous hover with proper state restoration
        if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
          this.unhighlightObject(this.hoveredObject);
          // Restore dimming if isolation is active and object is not the isolated one
          if (
            this.isolatedObject &&
            this.hoveredObject !== this.isolatedObject
          ) {
            const original = this.originalMaterials.get(
              this.hoveredObject.uuid
            );
            if (original && original.opacity !== undefined) {
              this.hoveredObject.material.opacity = 0.15;
              this.hoveredObject.material.transparent = true;
              // Restore emissive dimming
              if (this.hoveredObject.material.emissive && original.emissive) {
                this.hoveredObject.material.emissiveIntensity = 0.1;
              }
              this.hoveredObject.material.needsUpdate = true;
            }
          }
        }

        // Add new hover (only if not selected and more subtle if isolation is active)
        this.hoveredObject = object;
        if (object !== this.selectedObject) {
          // If isolation is active and hovering over non-isolated object, use subtle highlight
          if (this.isolatedObject && object !== this.isolatedObject) {
            this.highlightObject(object, 0x88aaff, 0.2);
            object.material.opacity = 0.35; // Slightly brighter than other dimmed objects
            object.material.needsUpdate = true;
          } else {
            // Normal hover highlight for non-isolated scenarios
            this.highlightObject(object, 0x88aaff, 0.3);
          }
        }

        // Change cursor
        this.renderer.domElement.style.cursor = "pointer";

        // Dispatch hover event
        this.container.dispatchEvent(
          new CustomEvent("modelHover", {
            detail: {
              object: object,
              point: intersects[0].point,
            },
          })
        );
      }
    } else {
      // No intersection - remove hover with complete state restoration
      if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
        this.unhighlightObject(this.hoveredObject);
        // Restore dimming if isolation is active
        if (this.isolatedObject && this.hoveredObject !== this.isolatedObject) {
          const original = this.originalMaterials.get(this.hoveredObject.uuid);
          if (original && original.opacity !== undefined) {
            this.hoveredObject.material.opacity = 0.15;
            this.hoveredObject.material.transparent = true;
            // Restore emissive dimming for consistency
            if (this.hoveredObject.material.emissive && original.emissive) {
              this.hoveredObject.material.emissiveIntensity = 0.1;
            }
            this.hoveredObject.material.needsUpdate = true;
          }
        }
      }
      this.hoveredObject = null;
      this.renderer.domElement.style.cursor = "default";
    }
  }

  /**
   * Update mouse position for raycasting
   */
  updateMousePosition(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Get intersections with 3D objects
   */
  getIntersections() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (!this.currentModel) return [];

    // Only check meshes in the current model
    const meshes = [];
    this.currentModel.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });

    return this.raycaster.intersectObjects(meshes, false);
  }

  /**
   * Select a 3D object with enhanced visual feedback and isolation
   */
  selectObject(object, point) {
    // Deselect previous
    if (this.selectedObject && this.selectedObject !== object) {
      this.deselectObject();
    }

    // Check if already selected (avoid redundant operations)
    if (this.selectedObject === object) {
      console.log(
        "[Viewer] Object already selected, skipping redundant selection"
      );
      return;
    }

    this.selectedObject = object;
    this.highlightObject(object, 0xffaa00, 0.8); // Increased opacity for stronger highlight

    // Visually isolate the selected object by dimming others
    this.isolateObject(object);

    // Emit selection event via EventBus for hierarchy integration with complete data
    if (this.eventBus) {
      this.eventBus.emit("viewer:object-selected", {
        object: object,
        point: point,
        objectName: object.name || "Unnamed",
        objectType: object.type,
        isolated: true,
        timestamp: Date.now(),
      });
    }

    // Dispatch selection event (legacy support)
    this.container.dispatchEvent(
      new CustomEvent("modelSelect", {
        detail: {
          object: object,
          point: point,
          objectName: object.name || "Unnamed",
          modelName: this.currentModel?.name || "Current Model",
          isolated: true,
        },
      })
    );

    console.log(
      "[Viewer] Object selected and isolated:",
      object.name || object.type
    );
  }

  /**
   * Deselect current object and restore all objects
   */
  deselectObject() {
    if (this.selectedObject) {
      this.unhighlightObject(this.selectedObject);
      const previousObject = this.selectedObject;
      this.selectedObject = null;

      // Restore all objects from isolation
      this.restoreAllObjects();

      // Emit deselection event via EventBus
      if (this.eventBus) {
        this.eventBus.emit("viewer:object-deselected", {
          object: previousObject,
          objectName: previousObject.name || "Unnamed",
          timestamp: Date.now(),
        });
      }

      // Dispatch deselection event (legacy support)
      this.container.dispatchEvent(
        new CustomEvent("modelDeselect", {
          detail: { object: previousObject },
        })
      );

      console.log(
        "[Viewer] Object deselected and isolation cleared:",
        previousObject.name || previousObject.type
      );
    }
  }

  /**
   * Find object in scene by UUID
   * @param {string} uuid - Object UUID
   * @returns {THREE.Object3D|null} Found object or null
   */
  getObjectByUuid(uuid) {
    if (!this.currentModel) return null;
    return this.currentModel.getObjectByProperty("uuid", uuid);
  }

  /**
   * Highlight an object with enhanced visual effects
   */
  highlightObject(object, color, opacity) {
    if (!object.isMesh) return;

    // Store original material if not already stored
    if (!this.originalMaterials.has(object.uuid)) {
      this.originalMaterials.set(object.uuid, {
        material: object.material,
        color: object.material.color?.clone(),
        emissive: object.material.emissive?.clone(),
        emissiveIntensity: object.material.emissiveIntensity || 1.0,
        opacity: object.material.opacity,
        transparent: object.material.transparent,
        scale: object.scale.clone(),
      });
    }

    // Apply enhanced highlight with emissive glow
    if (object.material.emissive) {
      object.material.emissive.setHex(color);
      object.material.emissiveIntensity = opacity * 2.5; // Enhanced glow for better visibility
    }

    // Ensure selected object is fully visible (not dimmed)
    if (opacity > 0.5) {
      object.material.opacity = 1.0;
      object.material.transparent = false;
      object.material.needsUpdate = true;
    }

    // Add subtle scale pulse for focused objects - section list click feedback
    if (opacity > 0.5) {
      const pulseScale = 1.05; // More visible pulse for section list interactions
      object.scale.multiplyScalar(pulseScale);

      // Animate back to original scale with smooth transition
      setTimeout(() => {
        if (this.originalMaterials.has(object.uuid)) {
          const original = this.originalMaterials.get(object.uuid);
          if (original && original.scale) {
            object.scale.copy(original.scale);
          }
        }
      }, 350); // Slightly longer for better visibility
    }

    // Emit highlight event
    if (this.eventBus) {
      this.eventBus.emit("viewer:object-highlighted", {
        object,
        color,
        opacity,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Remove highlight from object and restore original state
   */
  unhighlightObject(object) {
    if (!object.isMesh) return;

    const original = this.originalMaterials.get(object.uuid);
    if (original) {
      // Restore emissive properties
      if (object.material.emissive) {
        if (original.emissive) {
          object.material.emissive.copy(original.emissive);
        } else {
          object.material.emissive.setHex(0x000000);
        }
        object.material.emissiveIntensity = original.emissiveIntensity || 1.0;
      }

      // Restore scale if modified
      if (original.scale) {
        object.scale.copy(original.scale);
      }
    }

    // Emit unhighlight event
    if (this.eventBus) {
      this.eventBus.emit("viewer:object-unhighlighted", {
        object,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Visually isolate an object by dimming all other objects
   */
  isolateObject(targetObject) {
    if (!this.currentModel || !targetObject) {
      console.warn("[Viewer] Cannot isolate: missing model or target object");
      return;
    }

    if (!targetObject.isMesh) {
      console.warn("[Viewer] Cannot isolate: target is not a mesh");
      return;
    }

    try {
      // Store isolation state
      this.isolatedObject = targetObject;

      this.currentModel.traverse((child) => {
        if (child.isMesh && child !== targetObject) {
          // Store original material properties if not already stored
          if (!this.originalMaterials.has(child.uuid)) {
            this.originalMaterials.set(child.uuid, {
              material: child.material,
              opacity: child.material.opacity,
              transparent: child.material.transparent,
              emissive: child.material.emissive?.clone(),
              emissiveIntensity: child.material.emissiveIntensity || 1.0,
            });
          }

          // Apply strong dimming effect with desaturation
          child.material.transparent = true;
          child.material.opacity = 0.15; // Stronger dimming (85% reduction)

          // Reduce emissive intensity to further dim non-selected objects
          if (child.material.emissive) {
            child.material.emissiveIntensity = 0.1;
          }

          child.material.needsUpdate = true;
        } else if (child === targetObject) {
          // Ensure selected object is fully opaque and bright
          child.material.opacity = 1.0;
          child.material.transparent = false;
          child.material.needsUpdate = true;
        }
      });

      // Emit isolation event
      if (this.eventBus) {
        this.eventBus.emit("viewer:object-isolated", {
          object: targetObject,
          timestamp: Date.now(),
        });
      }

      // Show isolation indicator in UI
      this.showIsolationIndicator();

      console.log(
        "[Viewer] Object isolated:",
        targetObject.name || targetObject.type
      );
    } catch (error) {
      console.error("[Viewer] Error during isolation:", error);
      this.isolatedObject = null;
    }
  }

  /**
   * Restore all objects from isolation state
   */
  restoreAllObjects() {
    if (!this.currentModel) {
      console.warn("[Viewer] Cannot restore: no model loaded");
      return;
    }

    try {
      // Clear isolation state
      this.isolatedObject = null;

      this.currentModel.traverse((child) => {
        if (child.isMesh) {
          const original = this.originalMaterials.get(child.uuid);
          if (original && original.opacity !== undefined) {
            // Restore original opacity and transparency
            child.material.opacity = original.opacity;
            child.material.transparent = original.transparent;

            // Restore original emissive properties
            if (original.emissive && child.material.emissive) {
              child.material.emissive.copy(original.emissive);
              child.material.emissiveIntensity = original.emissiveIntensity;
            }

            child.material.needsUpdate = true;
          }
        }
      });

      // Emit restoration event
      if (this.eventBus) {
        this.eventBus.emit("viewer:objects-restored", {
          timestamp: Date.now(),
        });
      }

      // Hide isolation indicator in UI
      this.hideIsolationIndicator();

      console.log("[Viewer] All objects restored from isolation");
    } catch (error) {
      console.error("[Viewer] Error during restoration:", error);
      // Ensure indicator is hidden even if restoration fails
      this.hideIsolationIndicator();
    }
  }

  /**
   * Clear all highlights from all objects
   * Used by section highlight manager for cleanup
   */
  clearHighlights() {
    if (!this.currentModel) return;

    this.currentModel.traverse((child) => {
      if (child.isMesh) {
        // Restore original material if it was modified
        if (child.userData.originalMaterial) {
          child.material = child.userData.originalMaterial;
          delete child.userData.originalMaterial;
        }

        // Also restore using originalMaterials map
        const original = this.originalMaterials.get(child.uuid);
        if (original) {
          if (original.emissive && child.material.emissive) {
            child.material.emissive.copy(original.emissive);
            child.material.emissiveIntensity = original.emissiveIntensity;
          }
          if (original.scale) {
            child.scale.copy(original.scale);
          }
          child.material.needsUpdate = true;
        }
      }
    });

    console.log("[Viewer] All highlights cleared");
  }

  /**
   * Enable or disable model interaction
   */
  setInteractionEnabled(enabled) {
    this.interactionEnabled = enabled;
    if (!enabled) {
      this.deselectObject();
      if (this.hoveredObject) {
        this.unhighlightObject(this.hoveredObject);
        this.hoveredObject = null;
      }
      this.renderer.domElement.style.cursor = "default";
    }
  }

  /**
   * Toggle full-screen mode for the viewer
   * @returns {Promise<boolean>} Fullscreen state after toggle
   */
  async toggleFullscreen() {
    try {
      if (!this.isFullscreen) {
        // Enter fullscreen
        if (this.container.requestFullscreen) {
          await this.container.requestFullscreen();
        } else if (this.container.webkitRequestFullscreen) {
          await this.container.webkitRequestFullscreen();
        } else if (this.container.mozRequestFullScreen) {
          await this.container.mozRequestFullScreen();
        } else if (this.container.msRequestFullscreen) {
          await this.container.msRequestFullscreen();
        }
        return true;
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        return false;
      }
    } catch (error) {
      console.error("Fullscreen toggle error:", error);
      return this.isFullscreen;
    }
  }

  /**
   * Check if viewer is in fullscreen mode
   * @returns {boolean} Fullscreen state
   */
  isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  /**
   * Handle fullscreen change events
   */
  onFullscreenChange() {
    this.isFullscreen = this.isFullscreenActive();

    // Resize renderer when entering/exiting fullscreen
    setTimeout(() => {
      this.onWindowResize();
    }, 100);

    // Persist highlights and isolation during fullscreen transitions
    if (this.selectedObject) {
      setTimeout(() => {
        this.highlightObject(this.selectedObject, 0xffaa00, 0.8);
        // Note: Isolation is already active via isolatedObject state
        // Material properties are preserved, no need to re-isolate
      }, 150);
    }

    // Emit fullscreen event for hierarchy integration with isolation state
    if (this.eventBus) {
      this.eventBus.emit("viewer:fullscreen-changed", {
        isFullscreen: this.isFullscreen,
        selectedObject: this.selectedObject,
        isolated: this.isolatedObject !== null,
        timestamp: Date.now(),
      });
    }

    // Dispatch custom event for UI updates
    const event = new CustomEvent("fullscreenchange", {
      detail: { isFullscreen: this.isFullscreen },
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboard(event) {
    // Prevent default for handled keys
    const handled = [
      "KeyF",
      "KeyR",
      "KeyG",
      "KeyA",
      "KeyW",
      "KeyS",
      "Equal",
      "Minus",
      "Digit0",
      "Space",
    ];

    if (handled.includes(event.code) && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
    }

    switch (event.code) {
      case "KeyF": // F - Fullscreen
        this.toggleFullscreen();
        break;
      case "KeyR": // R - Reset view
        this.resetView();
        break;
      case "KeyG": // G - Toggle grid
        this.toggleGrid();
        break;
      case "KeyA": // A - Toggle axes
        this.toggleAxes();
        break;
      case "KeyW": // W - Toggle wireframe
        this.toggleWireframe();
        break;
      case "KeyS": // S - Toggle shadows
        this.toggleShadows();
        break;
      case "Equal": // + - Zoom in
      case "NumpadAdd":
        this.zoomIn();
        break;
      case "Minus": // - - Zoom out
      case "NumpadSubtract":
        this.zoomOut();
        break;
      case "Digit0": // 0 - Fit view
        this.fitToView();
        break;
      case "Space": // Space - Toggle auto-rotate
        event.preventDefault();
        this.toggleAutoRotate();
        break;
    }
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update controls
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get current viewer state for saving/restoring
   */
  getState() {
    return {
      camera: {
        position: this.camera.position.clone(),
        target: this.controls.target.clone(),
      },
      settings: { ...this.settings },
      wireframeMode: this.wireframeMode,
      autoRotate: this.autoRotate,
      isFullscreen: this.isFullscreen,
    };
  }

  /**
   * Restore viewer state from saved state object
   */
  setState(state) {
    if (!state) return;

    // Restore camera
    if (state.camera) {
      this.camera.position.copy(state.camera.position);
      this.controls.target.copy(state.camera.target);
      this.controls.update();
    }

    // Restore settings
    if (state.settings) {
      this.settings = { ...state.settings };

      // Apply settings to scene
      if (this.helpers.grid) {
        this.helpers.grid.visible = this.settings.showGrid;
      }
      if (this.helpers.axes) {
        this.helpers.axes.visible = this.settings.showAxes;
      }

      // Update shadows
      this.renderer.shadowMap.enabled = this.settings.enableShadows;
      if (this.lights.directional) {
        this.lights.directional.castShadow = this.settings.enableShadows;
      }

      // Update lighting
      if (this.lights.ambient) {
        this.lights.ambient.intensity = this.settings.ambientIntensity;
      }
      if (this.lights.directional) {
        this.lights.directional.intensity = this.settings.directionalIntensity;
      }

      // Update model scale
      if (this.currentModel) {
        this.currentModel.scale.setScalar(this.settings.modelScale);
      }
    }

    // Restore wireframe mode
    if (state.wireframeMode !== this.wireframeMode) {
      this.toggleWireframe();
    }

    // Restore auto-rotate
    if (state.autoRotate !== undefined) {
      this.autoRotate = state.autoRotate;
      this.controls.autoRotate = state.autoRotate;
    }

    // Restore fullscreen (if needed)
    if (state.isFullscreen && !this.isFullscreen) {
      this.toggleFullscreen();
    }
  }

  dispose() {
    console.log("[Viewer] Disposing viewer resources...");

    try {
      // Clean up event listeners first
      this.cleanup();

      // Dispose renderer
      if (this.renderer) {
        this.renderer.dispose();
      }

      // Dispose controls
      if (this.controls) {
        this.controls.dispose();
      }

      // Cancel animation frame
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }

      // Clear scene
      if (this.scene) {
        this.scene.clear();
      }

      console.log("[Viewer] Disposal complete");
    } catch (error) {
      console.error("[Viewer] Error during disposal:", error);
    }
  }

  /**
   * Clean up all event listeners
   * Call this when the viewer is being destroyed
   */
  cleanup() {
    console.log("[Viewer] Cleaning up event listeners...");

    try {
      if (this.eventManager) {
        this.eventManager.clear();
        console.log("[Viewer] Event listeners cleaned up");
      }
    } catch (error) {
      console.error("[Viewer] Error during cleanup:", error);
    }
  }

  /**
   * Show isolation mode indicator in UI
   * @private
   */
  showIsolationIndicator() {
    this._toggleIsolationIndicator(true);
  }

  /**
   * Hide isolation mode indicator in UI
   * @private
   */
  hideIsolationIndicator() {
    this._toggleIsolationIndicator(false);
  }

  /**
   * Toggle isolation indicator visibility
   * @private
   */
  _toggleIsolationIndicator(show) {
    const indicator = document.getElementById("isolationIndicator");
    if (indicator) {
      indicator.style.display = show ? "block" : "none";
    }
  }
}
