/**
 * Keyboard Shortcuts Service
 * Handles keyboard input and shortcuts for enhanced user experience
 * Following Single Responsibility Principle
 */

export class KeyboardShortcutsService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.shortcuts = this.initializeShortcuts();
    this.enabled = true;
    this.bindEvents();
  }

  /**
   * Initialize keyboard shortcuts mapping
   */
  initializeShortcuts() {
    return {
      // View controls
      r: { action: 'RESET_VIEW', description: 'Reset camera view', ctrlKey: false },
      f: { action: 'FRAME_OBJECT', description: 'Frame model in view', ctrlKey: false },
      h: { action: 'TOGGLE_HELP', description: 'Toggle help overlay', ctrlKey: false },
      w: { action: 'TOGGLE_WIREFRAME', description: 'Toggle wireframe mode', ctrlKey: false },

      // Camera presets (with Shift)
      ArrowUp: { action: 'CAMERA_TOP', description: 'Top view', shiftKey: true },
      ArrowDown: { action: 'CAMERA_BOTTOM', description: 'Bottom view', shiftKey: true },
      ArrowLeft: { action: 'CAMERA_LEFT', description: 'Left view', shiftKey: true },
      ArrowRight: { action: 'CAMERA_RIGHT', description: 'Right view', shiftKey: true },
      1: { action: 'CAMERA_FRONT', description: 'Front view', ctrlKey: false },
      2: { action: 'CAMERA_BACK', description: 'Back view', ctrlKey: false },
      3: { action: 'CAMERA_LEFT', description: 'Left view', ctrlKey: false },
      4: { action: 'CAMERA_RIGHT', description: 'Right view', ctrlKey: false },
      5: { action: 'CAMERA_TOP', description: 'Top view', ctrlKey: false },
      6: { action: 'CAMERA_BOTTOM', description: 'Bottom view', ctrlKey: false },
      7: { action: 'CAMERA_ISOMETRIC', description: 'Isometric view', ctrlKey: false },

      // Focus mode
      Escape: { action: 'EXIT_FOCUS', description: 'Exit focus mode', ctrlKey: false },

      // Fullscreen
      F11: { action: 'TOGGLE_FULLSCREEN', description: 'Toggle fullscreen', ctrlKey: false },

      // Section navigation - Note: Shift+Tab handled separately

      // Refresh
      F5: { action: 'REFRESH', description: 'Refresh view', ctrlKey: false },

      // Export (with Ctrl)
      e: { action: 'EXPORT_MODEL', description: 'Export model', ctrlKey: true },

      // Search
      '/': { action: 'FOCUS_SEARCH', description: 'Focus search box', ctrlKey: false },
    };
  }

  /**
   * Bind keyboard event listeners
   */
  bindEvents() {
    document.addEventListener('keydown', e => this.handleKeydown(e));
  }

  /**
   * Handle keydown event
   */
  handleKeydown(event) {
    if (!this.enabled) return;

    // Don't handle shortcuts when typing in input fields
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.isContentEditable
    ) {
      // Allow specific shortcuts even in input fields
      if (event.key === 'Escape') {
        event.target.blur();
      }
      return;
    }

    const key = event.key;
    const shortcut = this.findShortcut(key, event.ctrlKey, event.shiftKey, event.altKey);

    if (shortcut) {
      // Prevent default browser behavior for captured shortcuts
      if (this.shouldPreventDefault(key)) {
        event.preventDefault();
      }

      // Emit event for the action
      this.eventBus.emit(`SHORTCUT_${shortcut.action}`, event);
      console.log(`Keyboard shortcut triggered: ${key} -> ${shortcut.action}`);
    }
  }

  /**
   * Find matching shortcut
   */
  findShortcut(key, ctrlKey, shiftKey, altKey) {
    for (const [shortcutKey, config] of Object.entries(this.shortcuts)) {
      if (shortcutKey === key) {
        const ctrlMatch = config.ctrlKey === ctrlKey || config.ctrlKey === undefined;
        const shiftMatch = config.shiftKey === shiftKey || config.shiftKey === undefined;
        const altMatch = config.altKey === altKey || config.altKey === undefined;

        if (ctrlMatch && shiftMatch && altMatch) {
          return config;
        }
      }
    }
    return null;
  }

  /**
   * Check if default behavior should be prevented
   */
  shouldPreventDefault(key) {
    const preventKeys = ['Tab', 'F5', 'F11', '/'];
    return preventKeys.includes(key);
  }

  /**
   * Enable shortcuts
   */
  enable() {
    this.enabled = true;
    console.log('Keyboard shortcuts enabled');
  }

  /**
   * Disable shortcuts
   */
  disable() {
    this.enabled = false;
    console.log('Keyboard shortcuts disabled');
  }

  /**
   * Get all shortcuts for help display
   */
  getAllShortcuts() {
    const grouped = {
      'View Controls': [],
      'Camera Presets': [],
      Navigation: [],
      Advanced: [],
    };

    for (const [key, config] of Object.entries(this.shortcuts)) {
      const modifiers = [];
      if (config.ctrlKey) modifiers.push('Ctrl');
      if (config.shiftKey) modifiers.push('Shift');
      if (config.altKey) modifiers.push('Alt');

      const shortcutDisplay = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;

      const shortcutInfo = {
        key: shortcutDisplay,
        description: config.description,
      };

      // Categorize shortcuts
      if (config.action.startsWith('CAMERA_')) {
        grouped['Camera Presets'].push(shortcutInfo);
      } else if (['NEXT_SECTION', 'PREV_SECTION', 'EXIT_FOCUS'].includes(config.action)) {
        grouped['Navigation'].push(shortcutInfo);
      } else if (['EXPORT_MODEL', 'FOCUS_SEARCH'].includes(config.action)) {
        grouped['Advanced'].push(shortcutInfo);
      } else {
        grouped['View Controls'].push(shortcutInfo);
      }
    }

    return grouped;
  }

  /**
   * Dispose of resources
   */
  dispose() {
    document.removeEventListener('keydown', e => this.handleKeydown(e));
  }
}
