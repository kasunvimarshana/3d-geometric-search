import * as THREE from 'three';

/**
 * SceneManager
 *
 * Manages the 3D scene including model objects, helpers (grid, axes),
 * and scene operations like adding/removing objects.
 */
export class SceneManager {
  constructor(scene) {
    this.scene = scene;
    this.modelGroup = new THREE.Group();
    this.modelGroup.name = 'ModelGroup';
    this.scene.add(this.modelGroup);

    this.helpers = {
      grid: null,
      axes: null,
    };

    this.setupHelpers();
  }

  /**
   * Setup scene helpers
   */
  setupHelpers() {
    // Grid helper
    this.helpers.grid = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    this.helpers.grid.name = 'Grid';
    this.scene.add(this.helpers.grid);

    // Axes helper
    this.helpers.axes = new THREE.AxesHelper(5);
    this.helpers.axes.name = 'Axes';
    this.scene.add(this.helpers.axes);
  }

  /**
   * Add model to scene
   */
  addModel(object3D) {
    this.clearModel();
    this.modelGroup.add(object3D);
    return this.modelGroup;
  }

  /**
   * Clear current model
   */
  clearModel() {
    while (this.modelGroup.children.length > 0) {
      const child = this.modelGroup.children[0];
      this.modelGroup.remove(child);
      this.disposeObject(child);
    }
  }

  /**
   * Get model group
   */
  getModelGroup() {
    return this.modelGroup;
  }

  /**
   * Show/hide grid
   */
  setGridVisible(visible) {
    if (this.helpers.grid) {
      this.helpers.grid.visible = visible;
    }
  }

  /**
   * Show/hide axes
   */
  setAxesVisible(visible) {
    if (this.helpers.axes) {
      this.helpers.axes.visible = visible;
    }
  }

  /**
   * Find object by name
   */
  findObjectByName(name) {
    return this.modelGroup.getObjectByName(name);
  }

  /**
   * Find object by ID
   */
  findObjectById(id) {
    let found = null;
    this.modelGroup.traverse((object) => {
      if (object.userData.sectionId === id) {
        found = object;
      }
    });
    return found;
  }

  /**
   * Get all mesh objects
   */
  getAllMeshes() {
    const meshes = [];
    this.modelGroup.traverse((object) => {
      if (object.isMesh) {
        meshes.push(object);
      }
    });
    return meshes;
  }

  /**
   * Calculate scene bounds
   */
  calculateSceneBounds() {
    const box = new THREE.Box3();
    box.setFromObject(this.modelGroup);

    if (box.isEmpty()) {
      return null;
    }

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    return {
      min: box.min,
      max: box.max,
      center,
      size,
    };
  }

  /**
   * Dispose object and its resources
   */
  disposeObject(object) {
    object.traverse((node) => {
      if (node.geometry) {
        node.geometry.dispose();
      }

      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach((material) => this.disposeMaterial(material));
        } else {
          this.disposeMaterial(node.material);
        }
      }
    });
  }

  /**
   * Dispose material and its textures
   */
  disposeMaterial(material) {
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.envMap) material.envMap.dispose();
    material.dispose();
  }

  /**
   * Clear scene
   */
  clear() {
    this.clearModel();
  }
}
