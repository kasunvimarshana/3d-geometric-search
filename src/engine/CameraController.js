import * as THREE from 'three';

/**
 * CameraController
 *
 * Manages camera operations including positioning, focus,
 * fit-to-view, and zoom controls.
 */
export class CameraController {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.defaultPosition = new THREE.Vector3(5, 5, 5);
    this.defaultTarget = new THREE.Vector3(0, 0, 0);
  }

  /**
   * Reset camera to default position
   */
  reset() {
    this.camera.position.copy(this.defaultPosition);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();
  }

  /**
   * Fit camera to bounds
   */
  fitToBounds(bounds, padding = 1.2) {
    if (!bounds || !bounds.size) {
      this.reset();
      return;
    }

    const center = bounds.center;
    const size = bounds.size;

    // Calculate the maximum dimension
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * padding;

    // Set camera position
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    this.camera.position.copy(direction.multiplyScalar(cameraDistance).add(center));

    this.controls.target.copy(center);
    this.controls.update();

    // Update near/far planes
    this.camera.near = cameraDistance / 100;
    this.camera.far = cameraDistance * 100;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Focus camera on specific object
   */
  focusOnObject(object, padding = 1.5) {
    const box = new THREE.Box3().setFromObject(object);

    if (box.isEmpty()) {
      return;
    }

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const bounds = {
      center,
      size,
      min: box.min,
      max: box.max,
    };

    this.fitToBounds(bounds, padding);
  }

  /**
   * Set zoom level
   */
  setZoom(zoomLevel) {
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    const distance = this.camera.position.distanceTo(this.controls.target);
    const newDistance = distance / zoomLevel;

    this.camera.position.copy(direction.multiplyScalar(newDistance).add(this.controls.target));

    this.controls.update();
  }

  /**
   * Get current zoom level
   */
  getZoom() {
    const distance = this.camera.position.distanceTo(this.controls.target);
    return 10 / distance; // Normalize to a reasonable scale
  }

  /**
   * Set camera position
   */
  setPosition(x, y, z) {
    this.camera.position.set(x, y, z);
    this.controls.update();
  }

  /**
   * Set camera target
   */
  setTarget(x, y, z) {
    this.controls.target.set(x, y, z);
    this.controls.update();
  }

  /**
   * Enable/disable auto rotate
   */
  setAutoRotate(enabled, speed = 0.5) {
    this.controls.autoRotate = enabled;
    this.controls.autoRotateSpeed = speed;
  }

  /**
   * Get camera state
   */
  getState() {
    return {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
      zoom: this.getZoom(),
    };
  }

  /**
   * Restore camera state
   */
  setState(state) {
    if (state.position) {
      this.camera.position.copy(state.position);
    }
    if (state.target) {
      this.controls.target.copy(state.target);
    }
    this.controls.update();
  }
}
