/**
 * Configuration Repository
 * Manages application configuration persistence
 * Uses localStorage for browser-based persistence
 */

export class ConfigRepository {
  constructor(storageKey = 'viewer_config') {
    this.storageKey = storageKey;
    this.cache = null;
  }

  /**
   * Get default configuration
   *
   * @returns {Object}
   */
  getDefaults() {
    return {
      // Viewer settings
      viewer: {
        backgroundColor: '#1a1a1a',
        gridEnabled: true,
        axesEnabled: true,
        shadowsEnabled: true,
        antialiasing: true,
      },

      // Camera settings
      camera: {
        fov: 60,
        near: 0.1,
        far: 10000,
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
      },

      // Controls settings
      controls: {
        enableDamping: true,
        dampingFactor: 0.05,
        rotateSpeed: 1.0,
        zoomSpeed: 1.0,
        panSpeed: 1.0,
        minDistance: 0.1,
        maxDistance: 1000,
      },

      // Lighting settings
      lighting: {
        ambientIntensity: 0.4,
        directionalIntensity: 0.8,
        directionalPosition: { x: 5, y: 10, z: 7.5 },
      },

      // Section settings
      sections: {
        highlightColor: '#00ff00',
        selectionColor: '#0088ff',
        isolationOpacity: 0.1,
      },

      // UI settings
      ui: {
        sidebarWidth: 300,
        sidebarCollapsed: false,
        showStats: false,
        theme: 'dark',
      },

      // Format preferences
      formats: {
        preferredExport: 'gltf',
        autoDetect: true,
      },
    };
  }

  /**
   * Load configuration
   *
   * @returns {Object}
   */
  load() {
    if (this.cache) {
      return this.cache;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const config = JSON.parse(stored);
        this.cache = this.mergeWithDefaults(config);
        return this.cache;
      }
    } catch (error) {
      console.warn('Failed to load configuration:', error);
    }

    this.cache = this.getDefaults();
    return this.cache;
  }

  /**
   * Save configuration
   *
   * @param {Object} config - Configuration to save
   */
  save(config) {
    try {
      this.cache = config;
      localStorage.setItem(this.storageKey, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw new Error(`Configuration save failed: ${error.message}`);
    }
  }

  /**
   * Update partial configuration
   *
   * @param {string} path - Dot-notation path (e.g., 'viewer.backgroundColor')
   * @param {*} value - Value to set
   */
  update(path, value) {
    const config = this.load();
    const updated = this.setNestedValue(config, path, value);
    this.save(updated);
  }

  /**
   * Get configuration value by path
   *
   * @param {string} path - Dot-notation path
   * @returns {*}
   */
  get(path) {
    const config = this.load();
    return this.getNestedValue(config, path);
  }

  /**
   * Reset to defaults
   */
  reset() {
    const defaults = this.getDefaults();
    this.save(defaults);
    this.cache = defaults;
  }

  /**
   * Clear configuration (delete from storage)
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      this.cache = null;
    } catch (error) {
      console.error('Failed to clear configuration:', error);
    }
  }

  /**
   * Merge stored config with defaults (for new settings)
   *
   * @param {Object} stored - Stored configuration
   * @returns {Object} Merged configuration
   */
  mergeWithDefaults(stored) {
    const defaults = this.getDefaults();
    return this.deepMerge(defaults, stored);
  }

  /**
   * Deep merge objects
   *
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        result[key] = this.deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Get nested value by path
   *
   * @param {Object} obj - Object
   * @param {string} path - Dot-notation path
   * @returns {*}
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value by path
   *
   * @param {Object} obj - Object
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   * @returns {Object} New object with updated value
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const result = JSON.parse(JSON.stringify(obj)); // Deep clone

    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }

  /**
   * Export configuration as JSON
   *
   * @returns {string}
   */
  export() {
    const config = this.load();
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   *
   * @param {string} json - JSON string
   */
  import(json) {
    try {
      const config = JSON.parse(json);
      const merged = this.mergeWithDefaults(config);
      this.save(merged);
    } catch (error) {
      throw new Error(`Configuration import failed: ${error.message}`);
    }
  }
}
