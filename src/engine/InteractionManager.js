import * as THREE from 'three';

/**
 * InteractionManager
 *
 * Manages user interactions with the 3D scene including
 * raycasting, object picking, and hover effects.
 */
export class InteractionManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.selectableObjects = [];

    this.onHover = null;
    this.onClick = null;
    this.onDoubleClick = null;

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);

    this.domElement.addEventListener('mousemove', this.handleMouseMove);
    this.domElement.addEventListener('click', this.handleClick);
    this.domElement.addEventListener('dblclick', this.handleDoubleClick);
  }

  /**
   * Set selectable objects
   */
  setSelectableObjects(objects) {
    this.selectableObjects = objects;
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(event) {
    this.updateMousePosition(event);

    const intersects = this.raycast();
    const newHovered = intersects.length > 0 ? intersects[0].object : null;

    if (newHovered !== this.hoveredObject) {
      if (this.hoveredObject && this.onHover) {
        this.onHover(null, this.hoveredObject);
      }

      this.hoveredObject = newHovered;

      if (this.hoveredObject && this.onHover) {
        this.onHover(this.hoveredObject, null);
      }
    }

    // Update cursor
    this.domElement.style.cursor = this.hoveredObject ? 'pointer' : 'default';
  }

  /**
   * Handle click
   */
  handleClick(event) {
    this.updateMousePosition(event);

    const intersects = this.raycast();
    if (intersects.length > 0 && this.onClick) {
      this.onClick(intersects[0].object, event);
    }
  }

  /**
   * Handle double click
   */
  handleDoubleClick(event) {
    this.updateMousePosition(event);

    const intersects = this.raycast();
    if (intersects.length > 0 && this.onDoubleClick) {
      this.onDoubleClick(intersects[0].object, event);
    }
  }

  /**
   * Update mouse position
   */
  updateMousePosition(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Perform raycast
   */
  raycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(this.selectableObjects, true);
  }

  /**
   * Set hover callback
   */
  setOnHover(callback) {
    this.onHover = callback;
  }

  /**
   * Set click callback
   */
  setOnClick(callback) {
    this.onClick = callback;
  }

  /**
   * Set double click callback
   */
  setOnDoubleClick(callback) {
    this.onDoubleClick = callback;
  }

  /**
   * Dispose interaction manager
   */
  dispose() {
    this.domElement.removeEventListener('mousemove', this.handleMouseMove);
    this.domElement.removeEventListener('click', this.handleClick);
    this.domElement.removeEventListener('dblclick', this.handleDoubleClick);
    this.hoveredObject = null;
    this.selectableObjects = [];
  }
}
