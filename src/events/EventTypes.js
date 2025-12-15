/**
 * EventTypes
 *
 * Defines all application event types for type safety and documentation.
 */
export const EventTypes = {
  // File events
  FILE_UPLOAD: 'file:upload',
  FILE_LOAD_START: 'file:load-start',
  FILE_LOAD_PROGRESS: 'file:load-progress',
  FILE_LOAD_COMPLETE: 'file:load-complete',
  FILE_LOAD_ERROR: 'file:load-error',

  // Model events
  MODEL_LOADED: 'model:loaded',
  MODEL_CLEARED: 'model:cleared',
  MODEL_UPDATE: 'model:update',
  MODEL_TOGGLE_EXPLODE: 'model:toggle-explode',

  // Section events
  SECTION_SELECT: 'section:select',
  SECTION_DESELECT: 'section:deselect',
  SECTION_HIGHLIGHT: 'section:highlight',
  SECTION_DEHIGHLIGHT: 'section:dehighlight',
  SECTION_FOCUS: 'section:focus',
  SECTION_ISOLATE: 'section:isolate',
  SECTION_VISIBILITY: 'section:visibility',

  // View events
  VIEW_RESET: 'view:reset',
  VIEW_FIT: 'view:fit',
  VIEW_ZOOM: 'view:zoom',
  VIEW_TOGGLE_WIREFRAME: 'view:toggle-wireframe',
  VIEW_TOGGLE_GRID: 'view:toggle-grid',
  VIEW_TOGGLE_AXES: 'view:toggle-axes',
  VIEW_ROTATION_SPEED: 'view:rotation-speed',

  // Interaction events
  INTERACTION_HOVER: 'interaction:hover',
  INTERACTION_CLICK: 'interaction:click',
  INTERACTION_DOUBLE_CLICK: 'interaction:double-click',

  // State events
  STATE_CHANGED: 'state:changed',
  STATE_RESET: 'state:reset',

  // UI events
  UI_FULLSCREEN: 'ui:fullscreen',
  UI_SIDEBAR_TOGGLE: 'ui:sidebar-toggle',
  UI_LOADING: 'ui:loading',
  UI_ERROR: 'ui:error',

  // Error events
  ERROR: 'error',
  WARNING: 'warning',
};
