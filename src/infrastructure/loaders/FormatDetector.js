/**
 * Format Detector
 * Automatically detects 3D file format from various sources
 * Supports detection by extension, MIME type, and file content
 */

export class FormatDetector {
  /**
   * Format definitions with detection rules
   */
  static FORMATS = {
    gltf: {
      extensions: ['gltf'],
      mimeTypes: ['model/gltf+json'],
      contentCheck: content => {
        try {
          const json = JSON.parse(content);
          return json.asset && json.asset.version;
        } catch {
          return false;
        }
      },
    },
    glb: {
      extensions: ['glb'],
      mimeTypes: ['model/gltf-binary'],
      magicNumber: [0x67, 0x6c, 0x54, 0x46], // 'glTF'
    },
    obj: {
      extensions: ['obj'],
      mimeTypes: ['model/obj', 'text/plain'],
      contentCheck: content => {
        const markers = ['v ', 'vn ', 'vt ', 'f ', 'o ', 'g '];
        return markers.some(marker => content.includes(marker));
      },
    },
    stl: {
      extensions: ['stl', 'stla'],
      mimeTypes: ['model/stl', 'application/sla'],
      contentCheck: content => {
        const lower = content.toLowerCase();
        return lower.startsWith('solid') || lower.includes('facet');
      },
      magicNumber: null, // Binary STL has no specific magic number
    },
    step: {
      extensions: ['step', 'stp'],
      mimeTypes: ['application/step', 'model/step'],
      contentCheck: content => {
        const upper = content.toUpperCase();
        return upper.includes('ISO-10303') || upper.includes('STEP-FILE');
      },
    },
    fbx: {
      extensions: ['fbx'],
      mimeTypes: ['application/octet-stream'],
      magicNumber: [0x4b, 0x61, 0x79, 0x64, 0x61, 0x72, 0x61], // 'Kaydara' (ASCII)
    },
  };

  /**
   * Detect format from file
   *
   * @param {File} file - File to analyze
   * @returns {Promise<string|null>} Format name or null if unknown
   */
  static async detectFromFile(file) {
    // 1. Try extension-based detection
    const ext = file.name.split('.').pop().toLowerCase();
    const formatByExt = this.findFormatByExtension(ext);

    // 2. Try MIME type detection
    const formatByMime = this.findFormatByMIME(file.type);

    // 3. Try content-based detection
    const formatByContent = await this.detectFromContent(file);

    // Return most confident match
    // Content detection is most reliable, then extension, then MIME
    return formatByContent || formatByExt || formatByMime;
  }

  /**
   * Detect format from URL
   *
   * @param {string} url - URL to analyze
   * @returns {string|null} Format name or null if unknown
   */
  static detectFromURL(url) {
    try {
      const cleanUrl = url.split('?')[0]; // Remove query params
      const ext = cleanUrl.split('.').pop().toLowerCase();
      return this.findFormatByExtension(ext);
    } catch {
      return null;
    }
  }

  /**
   * Detect format from file content
   *
   * @param {File} file - File to analyze
   * @returns {Promise<string|null>}
   */
  static async detectFromContent(file) {
    try {
      // Read first 1KB for analysis
      const blob = file.slice(0, 1024);

      // Try as text first
      const text = await blob.text();

      // Check text-based formats
      for (const [format, config] of Object.entries(this.FORMATS)) {
        if (config.contentCheck && config.contentCheck(text)) {
          return format;
        }
      }

      // Try as binary
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Check magic numbers
      for (const [format, config] of Object.entries(this.FORMATS)) {
        if (config.magicNumber && this.checkMagicNumber(bytes, config.magicNumber)) {
          return format;
        }
      }

      return null;
    } catch (error) {
      console.warn('Content-based detection failed:', error);
      return null;
    }
  }

  /**
   * Find format by file extension
   *
   * @param {string} extension - File extension (without dot)
   * @returns {string|null}
   */
  static findFormatByExtension(extension) {
    const ext = extension.toLowerCase();

    for (const [format, config] of Object.entries(this.FORMATS)) {
      if (config.extensions.includes(ext)) {
        return format;
      }
    }

    return null;
  }

  /**
   * Find format by MIME type
   *
   * @param {string} mimeType - MIME type
   * @returns {string|null}
   */
  static findFormatByMIME(mimeType) {
    const mime = mimeType.toLowerCase();

    for (const [format, config] of Object.entries(this.FORMATS)) {
      if (config.mimeTypes && config.mimeTypes.includes(mime)) {
        return format;
      }
    }

    return null;
  }

  /**
   * Check if byte array starts with magic number
   *
   * @param {Uint8Array} bytes - Byte array
   * @param {number[]} magicNumber - Expected magic number
   * @returns {boolean}
   */
  static checkMagicNumber(bytes, magicNumber) {
    if (bytes.length < magicNumber.length) {
      return false;
    }

    for (let i = 0; i < magicNumber.length; i++) {
      if (bytes[i] !== magicNumber[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if format is supported
   *
   * @param {string} format - Format name
   * @returns {boolean}
   */
  static isFormatSupported(format) {
    return format in this.FORMATS;
  }

  /**
   * Get all supported formats
   *
   * @returns {string[]}
   */
  static getSupportedFormats() {
    return Object.keys(this.FORMATS);
  }

  /**
   * Get all supported extensions
   *
   * @returns {string[]}
   */
  static getSupportedExtensions() {
    const extensions = [];

    for (const config of Object.values(this.FORMATS)) {
      extensions.push(...config.extensions);
    }

    return extensions;
  }

  /**
   * Get format display name
   *
   * @param {string} format - Format name
   * @returns {string}
   */
  static getFormatDisplayName(format) {
    const names = {
      gltf: 'glTF 2.0',
      glb: 'glTF Binary',
      obj: 'Wavefront OBJ',
      stl: 'STL (Stereolithography)',
      step: 'STEP (ISO 10303)',
      fbx: 'Autodesk FBX',
    };

    return names[format] || format.toUpperCase();
  }

  /**
   * Get recommended format for web delivery
   *
   * @returns {string}
   */
  static getRecommendedFormat() {
    return 'glb'; // glTF Binary is best for web
  }
}
