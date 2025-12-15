/**
 * 3D Rendering Engine
 *
 * Handles all Three.js rendering operations following the Single Responsibility Principle.
 * Provides a clean interface between the domain layer and the rendering library.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class RenderEngine {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.meshMap = new Map(); // Maps section IDs to mesh objects
    this.animationFrameId = null;
    this.originalPositions = new Map(); // For disassembly/assembly

    this.init();
  }

  /**
   * Initializes the rendering engine
   */
  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f4f8);
    this.scene.fog = new THREE.Fog(0xf0f4f8, 50, 200);

    // Camera setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(5, 5, 5);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Controls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;

    // Raycaster for picking
    this.raycaster = new THREE.Raycaster();

    // Lighting
    this.setupLighting();

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Handle window resize
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener("resize", this.onWindowResize);

    // Start animation loop
    this.animate();
  }

  /**
   * Sets up scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light 1
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 10, 5);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight1);

    // Directional light 2
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, 5, -5);
    this.scene.add(directionalLight2);

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    this.scene.add(hemisphereLight);
  }

  /**
   * Loads a 3D model into the scene
   */
  loadModel(sceneObject, sections) {
    this.clearScene();

    // Store section-to-mesh mapping
    this.buildMeshMap(sceneObject, sections);

    // Add to scene
    this.scene.add(sceneObject);

    // Store original positions for disassembly
    this.storeOriginalPositions();

    // Fit camera to view
    this.fitCameraToModel();

    return true;
  }

  /**
   * Builds a map of section IDs to mesh objects
   */
  buildMeshMap(object, sections) {
    const traverse = (obj, sectionList) => {
      obj.traverse((child) => {
        if (child.isMesh) {
          // Try to match mesh to section
          const section = sectionList.find(
            (s) => s.meshId === child.uuid || s.name === child.name
          );

          if (section) {
            this.meshMap.set(section.id, child);
            child.userData.sectionId = section.id;
          }
        }
      });
    };

    traverse(object, sections);
  }

  /**
   * Stores original positions for disassembly
   */
  storeOriginalPositions() {
    this.originalPositions.clear();
    this.meshMap.forEach((mesh, sectionId) => {
      this.originalPositions.set(sectionId, {
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone(),
        scale: mesh.scale.clone(),
      });
    });
  }

  /**
   * Clears all models from the scene
   */
  clearScene() {
    const objectsToRemove = [];
    this.scene.traverse((object) => {
      if (object.isMesh || (object.isGroup && object.userData.isModel)) {
        objectsToRemove.push(object);
      }
    });

    objectsToRemove.forEach((object) => {
      this.scene.remove(object);
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.meshMap.clear();
    this.originalPositions.clear();
  }

  /**
   * Highlights a section
   */
  highlightSection(sectionId, highlighted = true) {
    const mesh = this.meshMap.get(sectionId);
    if (!mesh) return;

    if (highlighted) {
      // Store original material if not already stored
      if (!mesh.userData.originalMaterial) {
        mesh.userData.originalMaterial = mesh.material;
      }

      // Create highlight material
      const highlightMaterial = mesh.material.clone();
      highlightMaterial.emissive = new THREE.Color(0x3b82f6);
      highlightMaterial.emissiveIntensity = 0.3;
      mesh.material = highlightMaterial;
    } else {
      // Restore original material
      if (mesh.userData.originalMaterial) {
        mesh.material = mesh.userData.originalMaterial;
        delete mesh.userData.originalMaterial;
      }
    }
  }

  /**
   * Shows or hides a section
   */
  setSectionVisibility(sectionId, visible) {
    const mesh = this.meshMap.get(sectionId);
    if (mesh) {
      mesh.visible = visible;
    }
  }

  /**
   * Isolates specific sections (hides all others)
   */
  isolateSections(sectionIds) {
    const idsSet = new Set(sectionIds);
    this.meshMap.forEach((mesh, id) => {
      mesh.visible = idsSet.has(id);
    });
  }

  /**
   * Shows all sections
   */
  showAllSections() {
    this.meshMap.forEach((mesh) => {
      mesh.visible = true;
    });
  }

  /**
   * Disassembles the model (exploded view)
   */
  disassemble(distance = 2) {
    const center = this.getModelCenter();

    this.meshMap.forEach((mesh, sectionId) => {
      const original = this.originalPositions.get(sectionId);
      if (!original) return;

      // Calculate direction from center
      const direction = new THREE.Vector3()
        .subVectors(mesh.position, center)
        .normalize();

      // Apply explosion offset
      const offset = direction.multiplyScalar(distance);
      mesh.position.copy(original.position).add(offset);
    });
  }

  /**
   * Assembles the model (returns to original positions)
   */
  assemble() {
    this.meshMap.forEach((mesh, sectionId) => {
      const original = this.originalPositions.get(sectionId);
      if (original) {
        mesh.position.copy(original.position);
        mesh.rotation.copy(original.rotation);
        mesh.scale.copy(original.scale);
      }
    });
  }

  /**
   * Fits camera to view the entire model
   */
  fitCameraToModel() {
    const box = new THREE.Box3();

    this.scene.traverse((object) => {
      if (object.isMesh && object.visible) {
        box.expandByObject(object);
      }
    });

    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

    this.camera.position.set(
      center.x + cameraDistance * 0.5,
      center.y + cameraDistance * 0.5,
      center.z + cameraDistance
    );
    this.camera.lookAt(center);
    this.controls.target.copy(center);
    this.controls.update();
  }

  /**
   * Resets camera to default position
   */
  resetCamera() {
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * Gets the center of the loaded model
   */
  getModelCenter() {
    const box = new THREE.Box3();
    this.scene.traverse((object) => {
      if (object.isMesh) {
        box.expandByObject(object);
      }
    });
    return box.getCenter(new THREE.Vector3());
  }

  /**
   * Performs raycasting to detect clicked objects
   */
  raycast(mouseX, mouseY) {
    const rect = this.container.getBoundingClientRect();
    const x = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const y = -((mouseY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera({ x, y }, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    for (const intersect of intersects) {
      if (intersect.object.isMesh && intersect.object.userData.sectionId) {
        return intersect.object.userData.sectionId;
      }
    }

    return null;
  }

  /**
   * Handles window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener("resize", this.onWindowResize);
    this.clearScene();
    this.renderer.dispose();
    this.controls.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
