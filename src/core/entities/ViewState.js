/**
 * ViewState Entity
 *
 * Represents the current viewing state including camera position,
 * target, zoom level, and view mode.
 */
export class ViewState {
  constructor({
    cameraPosition = { x: 0, y: 0, z: 10 },
    cameraTarget = { x: 0, y: 0, z: 0 },
    zoomLevel = 1,
    viewMode = 'perspective',
    gridVisible = true,
    axesVisible = true,
    wireframeMode = false,
    autoRotate = false,
    rotationSpeed = 0,
  } = {}) {
    this.cameraPosition = cameraPosition;
    this.cameraTarget = cameraTarget;
    this.zoomLevel = zoomLevel;
    this.viewMode = viewMode;
    this.gridVisible = gridVisible;
    this.axesVisible = axesVisible;
    this.wireframeMode = wireframeMode;
    this.autoRotate = autoRotate;
    this.rotationSpeed = rotationSpeed;
  }

  /**
   * Clone view state
   */
  clone() {
    return new ViewState({
      cameraPosition: { ...this.cameraPosition },
      cameraTarget: { ...this.cameraTarget },
      zoomLevel: this.zoomLevel,
      viewMode: this.viewMode,
      gridVisible: this.gridVisible,
      axesVisible: this.axesVisible,
      wireframeMode: this.wireframeMode,
      autoRotate: this.autoRotate,
      rotationSpeed: this.rotationSpeed,
    });
  }

  /**
   * Reset to default state
   */
  reset() {
    this.cameraPosition = { x: 0, y: 0, z: 10 };
    this.cameraTarget = { x: 0, y: 0, z: 0 };
    this.zoomLevel = 1;
  }
}
