/**
 * Application-wide constants
 * Single source of truth for configuration values
 */

export const EVENTS = {
  // Model Lifecycle Events
  MODEL_LOAD_START: 'model:load:start',
  MODEL_LOAD_PROGRESS: 'model:load:progress',
  MODEL_LOADED: 'model:loaded',
  MODEL_LOAD_ERROR: 'model:load:error',
  MODEL_UNLOAD: 'model:unload',
  MODEL_UPDATED: 'model:updated',
  MODEL_PARSED: 'model:parsed',

  // Section Lifecycle Events
  SECTIONS_DISCOVERED: 'sections:discovered',
  SECTIONS_UPDATED: 'sections:updated',
  SECTION_SELECTED: 'section:selected',
  SECTION_DESELECTED: 'section:deselected',
  SECTION_ISOLATED: 'section:isolated',
  SECTION_HIGHLIGHTED: 'section:highlighted',
  SECTION_UNHIGHLIGHTED: 'section:unhighlighted',
  SECTION_VISIBILITY_CHANGED: 'section:visibility:changed',

  // Model Interaction Events
  MODEL_CLICKED: 'model:clicked',
  OBJECT_SELECTED: 'object:selected',
  OBJECT_DESELECTED: 'object:deselected',

  // Assembly/Disassembly Events
  MODEL_DISASSEMBLED: 'model:disassembled',
  MODEL_REASSEMBLED: 'model:reassembled',
  ISOLATION_CLEARED: 'isolation:cleared',

  // Focus and Navigation Events
  FOCUS_MODE_ENTERED: 'focus:entered',
  FOCUS_MODE_EXITED: 'focus:exited',
  FOCUS_TARGET_CHANGED: 'focus:target:changed',

  // Camera and View Events
  VIEW_RESET: 'view:reset',
  CAMERA_PRESET_CHANGED: 'camera:preset:changed',
  CAMERA_POSITION_CHANGED: 'camera:position:changed',
  FRAME_OBJECT: 'frame:object',

  // Visual State Events
  ZOOM_CHANGED: 'zoom:changed',
  WIREFRAME_TOGGLED: 'wireframe:toggled',
  GRID_TOGGLED: 'grid:toggled',
  AXES_TOGGLED: 'axes:toggled',
  FULLSCREEN_TOGGLED: 'fullscreen:toggled',

  // UI Synchronization Events
  UI_UPDATE_REQUIRED: 'ui:update:required',
  NAVIGATION_UPDATE_REQUIRED: 'navigation:update:required',
  SELECTION_STATE_CHANGED: 'selection:state:changed',

  // State Management Events
  STATE_CHANGED: 'state:changed',
  STATE_SNAPSHOT: 'state:snapshot',
  STATE_RESTORED: 'state:restored',

  // Error and Warning Events
  ERROR_OCCURRED: 'error:occurred',
  WARNING_OCCURRED: 'warning:occurred',
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
