/**
 * Camera state entity
 * Encapsulates camera position, target, and control settings
 */
export class Camera {
  constructor() {
    this.position = { x: 5, y: 5, z: 5 };
    this.target = { x: 0, y: 0, z: 0 };
    this.up = { x: 0, y: 1, z: 0 };
    this.fov = 50;
    this.near = 0.1;
    this.far = 1000;
    this.zoom = 1;
  }

  setPosition(x, y, z) {
    this.position = { x, y, z };
  }

  setTarget(x, y, z) {
    this.target = { x, y, z };
  }

  setZoom(zoom) {
    this.zoom = Math.max(0.1, Math.min(10, zoom));
  }

  reset() {
    this.position = { x: 5, y: 5, z: 5 };
    this.target = { x: 0, y: 0, z: 0 };
    this.zoom = 1;
  }

  clone() {
    const cloned = new Camera();
    cloned.position = { ...this.position };
    cloned.target = { ...this.target };
    cloned.up = { ...this.up };
    cloned.fov = this.fov;
    cloned.near = this.near;
    cloned.far = this.far;
    cloned.zoom = this.zoom;
    return cloned;
  }
}
