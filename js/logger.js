/**
 * Centralized Logging System
 * Provides consistent, configurable logging across the application
 * Follows clean architecture principles for better maintainability
 */

class Logger {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.level = options.level || "info"; // 'error', 'warn', 'info', 'debug'
    this.prefix = options.prefix || "";
    this.timestamp = options.timestamp || false;

    // Log levels hierarchy
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    this.currentLevel = this.levels[this.level] || this.levels.info;
  }

  /**
   * Format log message with prefix and optional timestamp
   * @private
   */
  _format(message, level = "info") {
    const parts = [];

    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }

    if (level !== "info") {
      parts.push(`[${level.toUpperCase()}]`);
    }

    parts.push(message);

    return parts.join(" ");
  }

  /**
   * Check if log level should be output
   * @private
   */
  _shouldLog(level) {
    return this.enabled && this.levels[level] <= this.currentLevel;
  }

  /**
   * Log error message
   */
  error(message, ...args) {
    if (this._shouldLog("error")) {
      console.error(this._format(message, "error"), ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message, ...args) {
    if (this._shouldLog("warn")) {
      console.warn(this._format(message, "warn"), ...args);
    }
  }

  /**
   * Log info message
   */
  info(message, ...args) {
    if (this._shouldLog("info")) {
      console.log(this._format(message, "info"), ...args);
    }
  }

  /**
   * Log debug message
   */
  debug(message, ...args) {
    if (this._shouldLog("debug")) {
      console.log(this._format(message, "debug"), ...args);
    }
  }

  /**
   * Create child logger with additional prefix
   */
  child(prefix) {
    return new Logger({
      enabled: this.enabled,
      level: this.level,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      timestamp: this.timestamp,
    });
  }

  /**
   * Set log level dynamically
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
      this.currentLevel = this.levels[level];
    }
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

/**
 * Global logger factory
 */
class LoggerFactory {
  constructor() {
    this.loggers = new Map();
    this.defaultConfig = {
      enabled: true,
      level: "info",
      timestamp: false,
    };
  }

  /**
   * Get or create logger for a module
   */
  getLogger(moduleName, config = {}) {
    if (!this.loggers.has(moduleName)) {
      this.loggers.set(
        moduleName,
        new Logger({
          ...this.defaultConfig,
          ...config,
          prefix: moduleName,
        })
      );
    }
    return this.loggers.get(moduleName);
  }

  /**
   * Configure all loggers
   */
  configure(config) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
    this.loggers.forEach((logger) => {
      logger.setLevel(config.level || this.defaultConfig.level);
      logger.setEnabled(config.enabled !== false);
    });
  }

  /**
   * Set global log level
   */
  setGlobalLevel(level) {
    this.defaultConfig.level = level;
    this.loggers.forEach((logger) => logger.setLevel(level));
  }

  /**
   * Enable/disable all logging
   */
  setGlobalEnabled(enabled) {
    this.defaultConfig.enabled = enabled;
    this.loggers.forEach((logger) => logger.setEnabled(enabled));
  }
}

// Export singleton instance
const loggerFactory = new LoggerFactory();

// Production mode: only show errors and warnings
if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
  loggerFactory.setGlobalLevel("warn");
}

// Make available globally
if (typeof window !== "undefined") {
  window.LoggerFactory = loggerFactory;
  window.Logger = Logger;
}

export { Logger, loggerFactory };
export default loggerFactory;
