/**
 * 3D Viewer - Manages the Three.js 3D viewport
 * Enhanced with advanced lighting, shadows, and control options
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Config from "./config.js";

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
    this.settings = {
      showGrid: true,
      showAxes: Config.debug.showAxesHelper,
      enableShadows: Config.viewer.enableShadows,
      ambientIntensity: Config.lighting.ambient.intensity,
      directionalIntensity: Config.lighting.directional.intensity,
      modelScale: 1.0,
      autoRotateSpeed: 0.5,
    };

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

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());

    // Handle fullscreen change
    document.addEventListener("fullscreenchange", () =>
      this.onFullscreenChange()
    );
    document.addEventListener("webkitfullscreenchange", () =>
      this.onFullscreenChange()
    );
    document.addEventListener("mozfullscreenchange", () =>
      this.onFullscreenChange()
    );
    document.addEventListener("MSFullscreenChange", () =>
      this.onFullscreenChange()
    );

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
        highlightMaterial.emissive.setHex(Config.viewer.highlightColor || 0x0284c7);
        highlightMaterial.emissiveIntensity = Config.viewer.highlightIntensity || 0.3;
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
        this.hoveredObject.material = this.hoveredObject.userData.originalMaterial;
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

  resetView() {
    const camPos = Config.viewer.defaultCameraPosition;
    this.camera.position.set(camPos.x, camPos.y, camPos.z);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
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
   * Fit camera to view the current model
   */
  fitToView() {
    if (!this.currentModel) return;

    const box = new THREE.Box3().setFromObject(this.currentModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

    this.controls.target.copy(center);

    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, center)
      .normalize();
    this.camera.position
      .copy(center)
      .addScaledVector(direction, cameraDistance);

    this.controls.update();
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
   * Focus camera on current model
   */
  focusOnModel() {
    if (!this.currentModel) return;

    const box = new THREE.Box3().setFromObject(this.currentModel);
    const center = box.getCenter(new THREE.Vector3());

    this.controls.target.copy(center);
    this.fitToView();
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

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
  }
}
