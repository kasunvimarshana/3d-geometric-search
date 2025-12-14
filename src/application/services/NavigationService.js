/**
 * Navigation Service
 * Implements INavigationService interface
 * Manages camera navigation, focus modes, and view presets
 */

import * as THREE from 'three';

export class NavigationService {
  constructor(camera, controls, eventBus) {
    this.camera = camera;
    this.controls = controls;
    this.eventBus = eventBus;
    this.focusMode = false;
    this.previousCameraState = null;
  }

  /**
   * Focus on specific section
   *
   * @param {THREE.Object3D} sectionObject - Section to focus on
   * @param {Object} [options] - Focus options
   * @param {number} [options.distance] - Camera distance multiplier
   * @param {number} [options.duration] - Animation duration (ms)
   */
  focusOnSection(sectionObject, options = {}) {
    const { distance = 2.0, duration = 500 } = options;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(sectionObject);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Calculate camera position
    const cameraDistance = maxDim * distance;
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    const newPosition = new THREE.Vector3()
      .copy(center)
      .add(direction.multiplyScalar(cameraDistance));

    // Enter focus mode
    if (!this.focusMode) {
      this.saveCameraState();
      this.focusMode = true;

      this.eventBus.emit('focus:entered', {
        sectionId: sectionObject.uuid,
        previousState: this.previousCameraState,
      });
    }

    // Animate camera
    this.animateCamera(newPosition, center, duration);
  }

  /**
   * Focus on entire model
   *
   * @param {THREE.Object3D} modelObject - Model to focus on
   * @param {Object} [options] - Focus options
   */
  focusOnModel(modelObject, options = {}) {
    this.focusOnSection(modelObject, { ...options, distance: 2.5 });
  }

  /**
   * Exit focus mode and restore previous camera state
   */
  exitFocusMode() {
    if (!this.focusMode || !this.previousCameraState) {
      return;
    }

    const { position, target } = this.previousCameraState;
    this.animateCamera(position, target, 500);

    this.focusMode = false;
    this.previousCameraState = null;

    this.eventBus.emit('focus:exited', {});
  }

  /**
   * Frame object in view (fit to viewport)
   *
   * @param {THREE.Object3D} object - Object to frame
   * @param {Object} [options] - Frame options
   */
  frameInView(object, options = {}) {
    const { padding = 1.2, duration = 500 } = options;

    // Calculate bounding sphere
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Calculate distance to fit object in view
    const fov = this.camera.fov * (Math.PI / 180);
    const distance = (maxDim / 2 / Math.tan(fov / 2)) * padding;

    // Position camera
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    const newPosition = new THREE.Vector3().copy(center).add(direction.multiplyScalar(distance));

    this.animateCamera(newPosition, center, duration);
  }

  /**
   * Reset view to default
   */
  resetView() {
    const defaultPosition = new THREE.Vector3(5, 5, 5);
    const defaultTarget = new THREE.Vector3(0, 0, 0);

    this.animateCamera(defaultPosition, defaultTarget, 500);

    this.focusMode = false;
    this.previousCameraState = null;

    this.eventBus.emit('view:reset', {});
  }

  /**
   * Set camera to preset position
   *
   * @param {string} preset - Preset name (front, back, left, right, top, bottom, isometric)
   * @param {THREE.Object3D} [target] - Optional target object
   */
  setCameraPreset(preset, target = null) {
    // Calculate target center
    const targetCenter = target
      ? new THREE.Box3().setFromObject(target).getCenter(new THREE.Vector3())
      : new THREE.Vector3(0, 0, 0);

    // Calculate distance based on target size or default
    let distance = 10;
    if (target) {
      const size = new THREE.Box3().setFromObject(target).getSize(new THREE.Vector3());
      distance = Math.max(size.x, size.y, size.z) * 2;
    }

    // Preset positions (unit vectors scaled by distance)
    const presets = {
      front: new THREE.Vector3(0, 0, distance),
      back: new THREE.Vector3(0, 0, -distance),
      left: new THREE.Vector3(-distance, 0, 0),
      right: new THREE.Vector3(distance, 0, 0),
      top: new THREE.Vector3(0, distance, 0),
      bottom: new THREE.Vector3(0, -distance, 0),
      isometric: new THREE.Vector3(distance, distance, distance)
        .normalize()
        .multiplyScalar(distance),
    };

    const position = presets[preset];
    if (!position) {
      throw new Error(`Unknown preset: ${preset}`);
    }

    // Add target offset
    position.add(targetCenter);

    this.animateCamera(position, targetCenter, 500);

    this.eventBus.emit('camera:preset:changed', {
      preset,
      position: position.toArray(),
      target: targetCenter.toArray(),
    });
  }

  /**
   * Animate camera to position
   *
   * @param {THREE.Vector3} targetPosition - Target camera position
   * @param {THREE.Vector3} targetLookAt - Target look-at point
   * @param {number} duration - Animation duration (ms)
   */
  animateCamera(targetPosition, targetLookAt, duration) {
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease in-out
      const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      // Interpolate position
      this.camera.position.lerpVectors(startPosition, targetPosition, t);
      this.controls.target.lerpVectors(startTarget, targetLookAt, t);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.eventBus.emit('camera:moved', {
          position: this.camera.position.toArray(),
          target: this.controls.target.toArray(),
        });
      }
    };

    animate();
  }

  /**
   * Save current camera state
   */
  saveCameraState() {
    this.previousCameraState = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
    };
  }

  /**
   * Get current camera state
   *
   * @returns {Object}
   */
  getCameraState() {
    return {
      position: this.camera.position.toArray(),
      target: this.controls.target.toArray(),
      fov: this.camera.fov,
      zoom: this.camera.zoom,
    };
  }

  /**
   * Check if in focus mode
   *
   * @returns {boolean}
   */
  isFocusMode() {
    return this.focusMode;
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.previousCameraState = null;
    this.focusMode = false;
  }
}
