/**
 * Application-wide constants
 * Single source of truth for configuration values
 */

export const EVENTS = {
  MODEL_LOADED: 'model:loaded',
  MODEL_LOAD_ERROR: 'model:load:error',
  SECTION_SELECTED: 'section:selected',
  SECTION_ISOLATED: 'section:isolated',
  SECTION_HIGHLIGHTED: 'section:highlighted',
  ISOLATION_CLEARED: 'isolation:cleared',
  VIEW_RESET: 'view:reset',
  ZOOM_CHANGED: 'zoom:changed',
  FULLSCREEN_TOGGLED: 'fullscreen:toggled',
  STATE_CHANGED: 'state:changed',
};

export const CAMERA_DEFAULTS = {
  FOV: 45,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 0, y: 5, z: 10 },
  TARGET: { x: 0, y: 0, z: 0 },
};

export const RENDERER_CONFIG = {
  ANTIALIAS: true,
  ALPHA: true,
  PIXEL_RATIO: window.devicePixelRatio || 1,
};

export const COLORS = {
  BACKGROUND: 0xf5f5f5,
  HIGHLIGHT: 0x4a90e2,
  ISOLATED: 0x50c878,
  DEFAULT: 0xcccccc,
  AMBIENT_LIGHT: 0xffffff,
  DIRECTIONAL_LIGHT: 0xffffff,
};

export const ANIMATION_DURATION = 300; // milliseconds

export const ZOOM_CONFIG = {
  MIN: 1,
  MAX: 200,
  DEFAULT: 100,
  STEP: 10,
};

export const MODEL_TYPES = {
  GLTF: 'gltf',
  GLB: 'glb',
  OBJ: 'obj',
  MTL: 'mtl',
  STL: 'stl',
  STEP: 'step',
  STP: 'stp',
  FBX: 'fbx',
};

export const SUPPORTED_FORMATS = {
  // Web-optimized formats (native Three.js support, preferred)
  WEB_NATIVE: ['gltf', 'glb'],

  // Common 3D formats (Three.js loaders available)
  COMMON: ['obj', 'stl', 'fbx'],

  // CAD/Engineering formats (require conversion or third-party libraries)
  CAD: ['step', 'stp'],

  // Future support (planned)
  PLANNED: ['dae', 'ply', '3ds'],
};

export const FILE_EXTENSIONS = {
  GLTF: ['.gltf', '.glb'],
  OBJ: ['.obj'],
  MTL: ['.mtl'],
  STL: ['.stl', '.stla'],
  FBX: ['.fbx'],
  STEP: ['.step', '.stp'],
};

export const MIME_TYPES = {
  GLTF: 'model/gltf+json',
  GLB: 'model/gltf-binary',
  OBJ: 'text/plain',
  STL: 'application/sla',
  FBX: 'application/octet-stream',
  STEP: 'application/step',
};
