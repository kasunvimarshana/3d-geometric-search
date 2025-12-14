/**
 * Selection Service
 * Manages model and section selection with raycasting
 * Handles click detection and selection state
 */

import * as THREE from 'three';

export class SelectionService {
  constructor(camera, scene, eventBus) {
    this.camera = camera;
    this.scene = scene;
    this.eventBus = eventBus;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.enabled = true;
  }

  /**
   * Handle click at screen coordinates
   *
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @param {HTMLElement} canvas - Canvas element
   * @returns {Object|null} Selection result
   */
  handleClick(x, y, canvas) {
    if (!this.enabled) {
      return null;
    }

    // Convert to normalized device coordinates (-1 to +1)
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Find intersections
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const result = this.processIntersection(intersection);

      if (result) {
        this.eventBus.emit('selection:clicked', result);
        return result;
      }
    }

    // No intersection - clicked on background
    this.eventBus.emit('selection:cleared', { x, y });
    return null;
  }

  /**
   * Handle hover at screen coordinates
   *
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @param {HTMLElement} canvas - Canvas element
   * @returns {Object|null} Hover result
   */
  handleHover(x, y, canvas) {
    if (!this.enabled) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const result = this.processIntersection(intersection);

      if (result) {
        this.eventBus.emit('selection:hover', result);
        return result;
      }
    }

    this.eventBus.emit('selection:hover:exit', {});
    return null;
  }

  /**
   * Process raycaster intersection
   *
   * @param {Object} intersection - Three.js intersection
   * @returns {Object|null} Processed result
   */
  processIntersection(intersection) {
    const { object, point, face, distance } = intersection;

    // Find section (traverse up to find named parent)
    let section = object;
    while (section && !section.name && section.parent) {
      section = section.parent;
    }

    // Find model root (traverse to top level)
    let model = section;
    while (model && model.parent && model.parent.type !== 'Scene') {
      model = model.parent;
    }

    return {
      meshId: object.uuid,
      meshName: object.name || 'Unnamed',
      sectionId: section.uuid,
      sectionName: section.name || 'Unnamed Section',
      modelId: model.uuid,
      modelName: model.name || 'Unnamed Model',
      point: point.toArray(),
      distance,
      faceIndex: face ? face.a : null,
    };
  }

  /**
   * Get object at screen coordinates
   *
   * @param {number} x - Screen X
   * @param {number} y - Screen Y
   * @param {HTMLElement} canvas - Canvas element
   * @returns {THREE.Object3D|null}
   */
  getObjectAt(x, y, canvas) {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    return intersects.length > 0 ? intersects[0].object : null;
  }

  /**
   * Get all objects at screen coordinates
   *
   * @param {number} x - Screen X
   * @param {number} y - Screen Y
   * @param {HTMLElement} canvas - Canvas element
   * @returns {THREE.Object3D[]}
   */
  getAllObjectsAt(x, y, canvas) {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    return intersects.map(i => i.object);
  }

  /**
   * Get intersection point at screen coordinates
   *
   * @param {number} x - Screen X
   * @param {number} y - Screen Y
   * @param {HTMLElement} canvas - Canvas element
   * @returns {THREE.Vector3|null}
   */
  getIntersectionPoint(x, y, canvas) {
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    return intersects.length > 0 ? intersects[0].point : null;
  }

  /**
   * Set raycaster parameters
   *
   * @param {Object} params - Raycaster parameters
   * @param {number} [params.near] - Near clipping plane
   * @param {number} [params.far] - Far clipping plane
   * @param {number} [params.threshold] - Point/Line threshold
   */
  setRaycasterParams(params) {
    if (params.near !== undefined) {
      this.raycaster.near = params.near;
    }
    if (params.far !== undefined) {
      this.raycaster.far = params.far;
    }
    if (params.threshold !== undefined) {
      this.raycaster.params.Points.threshold = params.threshold;
      this.raycaster.params.Line.threshold = params.threshold;
    }
  }

  /**
   * Enable/disable selection
   *
   * @param {boolean} enabled - Enabled state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if selection is enabled
   *
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.raycaster = null;
    this.mouse = null;
  }
}
