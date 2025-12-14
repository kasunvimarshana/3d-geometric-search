/**
 * Format Conversion Service
 * Handles conversion of unsupported formats (STEP, etc.) to web-friendly formats
 * Implements Strategy Pattern for different conversion approaches
 */

export class FormatConversionService {
  constructor() {
    this.conversionEndpoints = {
      // Default public conversion API (can be replaced with custom endpoint)
      step: 'https://api.opencascade.tech/v1/convert',
      // Fallback to client-side notification for user-driven conversion
      fallback: 'client-side',
    };
    this.conversionCache = new Map();
  }

  /**
   * Check if format requires conversion
   * @param {string} format - File format
   * @returns {boolean}
   */
  requiresConversion(format) {
    const conversionRequired = ['step', 'stp', 'iges', 'igs'];
    return conversionRequired.includes(format.toLowerCase());
  }

  /**
   * Convert STEP file to GLTF
   * @param {File|Blob} file - STEP file to convert
   * @param {Object} options - Conversion options
   * @returns {Promise<{success: boolean, data?: Blob, message?: string}>}
   */
  async convertSTEPToGLTF(file, options = {}) {
    try {
      // Check cache first
      const cacheKey = `${file.name}_${file.size}`;
      if (this.conversionCache.has(cacheKey)) {
        return this.conversionCache.get(cacheKey);
      }

      // Attempt server-side conversion
      const result = await this.serverSideConversion(file, 'step', 'gltf', options);

      if (result.success) {
        this.conversionCache.set(cacheKey, result);
        return result;
      }

      // Fallback to client-side instructions
      return this.clientSideInstructions('STEP');
    } catch (error) {
      console.error('STEP conversion failed:', error);
      return this.clientSideInstructions('STEP');
    }
  }

  /**
   * Server-side conversion using external API
   * @private
   */
  async serverSideConversion(file, sourceFormat, targetFormat, options) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', sourceFormat);
    formData.append('target', targetFormat);
    formData.append('quality', options.quality || 'high');
    formData.append('tessellation', options.tessellation || 'adaptive');

    try {
      const response = await fetch(this.conversionEndpoints.step, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Conversion API returned ${response.status}`);
      }

      const blob = await response.blob();

      return {
        success: true,
        data: blob,
        message: 'Conversion successful',
      };
    } catch (error) {
      return {
        success: false,
        message: `Server conversion failed: ${error.message}`,
      };
    }
  }

  /**
   * Provide client-side conversion instructions
   * @private
   */
  clientSideInstructions(format) {
    const instructions = {
      STEP: {
        format: 'STEP (ISO 10303)',
        tools: [
          {
            name: 'FreeCAD',
            url: 'https://www.freecadweb.org/',
            steps: ['Open STEP file', 'File → Export → glTF/GLB', 'Load converted file'],
          },
          {
            name: 'Blender',
            url: 'https://www.blender.org/',
            steps: [
              'Install CAD Importer add-on',
              'Import STEP file',
              'File → Export → glTF 2.0',
              'Load converted file',
            ],
          },
          {
            name: 'Online Converter',
            url: 'https://products.aspose.app/3d/conversion/step-to-gltf',
            steps: ['Upload STEP file', 'Convert to GLTF', 'Download and load'],
          },
        ],
        documentation: '/docs/STEP_FORMAT_GUIDE.md',
      },
    };

    return {
      success: false,
      requiresManualConversion: true,
      instructions: instructions[format],
      message: `${format} format requires conversion to GLTF/GLB. See conversion guide.`,
    };
  }

  /**
   * Configure custom conversion endpoint
   * @param {string} format - Format to configure
   * @param {string} endpoint - API endpoint URL
   */
  setConversionEndpoint(format, endpoint) {
    this.conversionEndpoints[format.toLowerCase()] = endpoint;
  }

  /**
   * Clear conversion cache
   */
  clearCache() {
    this.conversionCache.clear();
  }

  /**
   * Get cache size and statistics
   */
  getCacheStats() {
    return {
      size: this.conversionCache.size,
      entries: Array.from(this.conversionCache.keys()),
    };
  }
}
