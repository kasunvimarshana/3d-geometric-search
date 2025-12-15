/**
 * Scene Renderer
 * Manages Three.js scene, camera, and rendering
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EventType, dispatch } from "../events/EventDispatcher.js";
import { getBoundsCenter, getBoundsSize } from "../core/modelUtils.js";

export class SceneRenderer {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    this.currentModel = null;
    this.modelGroup = null;
    this.highlightedObjects = new Set();
    this.selectedObjects = new Set();
    this.hiddenObjects = new Set();

    this.init();
  }

  /**
   * Initializes the renderer
   */
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f5f5);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      10000
    );
    this.camera.position.set(5, 5, 5);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 1000;

    // Setup lighting
    this.setupLighting();

    // Add grid and axes
    this.addHelpers();

    // Handle resize
    window.addEventListener("resize", () => this.onResize());

    // Start animation loop
    this.animate();
  }

  /**
   * Sets up scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Directional light
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(10, 10, 10);
    directional.castShadow = true;
    directional.shadow.camera.near = 0.1;
    directional.shadow.camera.far = 100;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    this.scene.add(directional);

    // Hemisphere light
    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    this.scene.add(hemisphere);
  }

  /**
   * Adds visual helpers
   */
  addHelpers() {
    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xe0e0e0);
    this.scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  /**
   * Loads a model into the scene
   * @param {Model3D} model - Model to load
   */
  loadModel(model) {
    // Remove existing model
    if (this.modelGroup) {
      this.scene.remove(this.modelGroup);
      this.modelGroup = null;
    }

    this.currentModel = model;

    // Get Three.js scene from model
    if (model._threeScene) {
      this.modelGroup = new THREE.Group();
      this.modelGroup.add(model._threeScene);
      this.scene.add(this.modelGroup);

      // Fit camera to model
      this.fitCameraToModel(model);

      // Setup interaction
      this.setupInteraction();
    }
  }

  /**
   * Fits camera to view the entire model
   * @param {Model3D} model - Model to fit
   */
  fitCameraToModel(model) {
    if (!model.bounds) return;

    const center = getBoundsCenter(model.bounds);
    const size = getBoundsSize(model.bounds);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

    this.camera.position.set(
      center.x + cameraDistance,
      center.y + cameraDistance,
      center.z + cameraDistance
    );

    this.controls.target.set(center.x, center.y, center.z);
    this.controls.update();
  }

  /**
   * Resets camera to initial view
   */
  resetCamera() {
    if (this.currentModel) {
      this.fitCameraToModel(this.currentModel);
    } else {
      this.camera.position.set(5, 5, 5);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }

    dispatch(EventType.CAMERA_RESET, {});
  }

  /**
   * Focuses camera on a specific node
   * @param {ModelNode} node - Node to focus on
   */
  focusOnNode(node) {
    if (!node || !node.bounds) return;

    const center = getBoundsCenter(node.bounds);
    const size = getBoundsSize(node.bounds);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 2;

    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    this.camera.position.set(
      center.x + direction.x * cameraDistance,
      center.y + direction.y * cameraDistance,
      center.z + direction.z * cameraDistance
    );

    this.controls.target.set(center.x, center.y, center.z);
    this.controls.update();

    dispatch(EventType.CAMERA_FIT, { nodeId: node.id });
  }

  /**
   * Highlights a node
   * @param {ModelNode} node - Node to highlight
   */
  highlightNode(node) {
    if (!node || !node._threeObject) return;

    const object = node._threeObject;
    this.highlightedObjects.add(object);

    if (object.isMesh) {
      // Store original material
      if (!object.userData.originalMaterial) {
        object.userData.originalMaterial = object.material;
      }

      // Apply highlight material
      const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.5,
      });
      object.material = highlightMaterial;
    }
  }

  /**
   * Removes highlight from a node
   * @param {ModelNode} node - Node to unhighlight
   */
  unhighlightNode(node) {
    if (!node || !node._threeObject) return;

    const object = node._threeObject;
    this.highlightedObjects.delete(object);

    if (object.isMesh && object.userData.originalMaterial) {
      object.material = object.userData.originalMaterial;
      delete object.userData.originalMaterial;
    }
  }

  /**
   * Shows a node
   * @param {ModelNode} node - Node to show
   */
  showNode(node) {
    if (!node || !node._threeObject) return;

    node._threeObject.visible = true;
    this.hiddenObjects.delete(node._threeObject);
  }

  /**
   * Hides a node
   * @param {ModelNode} node - Node to hide
   */
  hideNode(node) {
    if (!node || !node._threeObject) return;

    node._threeObject.visible = false;
    this.hiddenObjects.add(node._threeObject);
  }

  /**
   * Shows all nodes
   */
  showAll() {
    if (this.modelGroup) {
      this.modelGroup.traverse((object) => {
        object.visible = true;
      });
    }
    this.hiddenObjects.clear();
  }

  /**
   * Sets up object interaction (clicking)
   */
  setupInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.renderer.domElement.addEventListener("click", (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);

      if (this.modelGroup) {
        const intersects = raycaster.intersectObjects(
          this.modelGroup.children,
          true
        );

        if (intersects.length > 0) {
          const object = intersects[0].object;

          // Find corresponding node
          const node = this.findNodeByThreeObject(object);
          if (node) {
            dispatch(EventType.SELECTION_CHANGE, { nodeIds: [node.id] });
          }
        }
      }
    });
  }

  /**
   * Finds a node by its Three.js object reference
   * @param {THREE.Object3D} object - Three.js object
   * @returns {ModelNode|null}
   */
  findNodeByThreeObject(object) {
    if (!this.currentModel) return null;

    const search = (node) => {
      if (node._threeObject === object) return node;

      if (node.children) {
        for (const child of node.children) {
          const result = search(child);
          if (result) return result;
        }
      }

      return null;
    };

    return search(this.currentModel.root);
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handles window resize
   */
  onResize() {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Disposes resources
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener("resize", () => this.onResize());

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.controls) {
      this.controls.dispose();
    }
  }
}
