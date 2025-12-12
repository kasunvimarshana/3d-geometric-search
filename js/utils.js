/**
 * Utility Functions Module
 * Common helper functions used across the application
 */

/**
 * Validate file type
 * @param {File} file - File object to validate
 * @param {Array<string>} allowedExtensions - Array of allowed extensions
 * @returns {boolean} True if valid
 */
export function validateFileType(file, allowedExtensions) {
  if (!file || !file.name) return false;

  const fileName = file.name.toLowerCase();
  return allowedExtensions.some((ext) => fileName.endsWith(ext));
}

/**
 * Validate file size
 * @param {File} file - File object to validate
 * @param {number} maxSizeMB - Maximum size in megabytes
 * @returns {boolean} True if valid
 */
export function validateFileSize(file, maxSizeMB = 100) {
  if (!file || !file.size) return false;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format number with locale
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(Math.round(num));
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in ms
 */
export function showToast(message, type = "info", duration = 3000) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".toast");
  existingToasts.forEach((toast) => toast.remove());

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(data, filename, mimeType = "text/plain") {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}

/**
 * Format vector to string
 * @param {Object} vector - Vector with x, y, z properties
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatVector(vector, decimals = 2) {
  return `(${vector.x.toFixed(decimals)}, ${vector.y.toFixed(
    decimals
  )}, ${vector.z.toFixed(decimals)})`;
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Check if value is numeric
 * @param {*} value - Value to check
 * @returns {boolean} True if numeric
 */
export function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Parse query string
 * @param {string} query - Query string
 * @returns {Object} Parsed parameters
 */
export function parseQueryString(query = window.location.search) {
  const params = {};
  const urlParams = new URLSearchParams(query);
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  return params;
}

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string} Extension (lowercase, with dot)
 */
export function getFileExtension(filename) {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : "";
}

/**
 * Safe JSON parse
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed object or default value
 */
export function safeJSONParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("JSON parse error:", e);
    return defaultValue;
  }
}

/**
 * Create element with attributes
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Attributes object
 * @param {string|Array} children - Children elements or text
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, children = null) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes)) {
    if (key === "className") {
      element.className = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  }

  if (children) {
    if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    } else if (typeof children === "string") {
      element.textContent = children;
    } else {
      element.appendChild(children);
    }
  }

  return element;
}

export default {
  validateFileType,
  validateFileSize,
  formatFileSize,
  formatNumber,
  debounce,
  throttle,
  generateId,
  deepClone,
  showToast,
  downloadFile,
  copyToClipboard,
  formatVector,
  clamp,
  lerp,
  isNumeric,
  parseQueryString,
  getFileExtension,
  safeJSONParse,
  createElement,
};
