/**
 * Abstract base loader class
 * All format-specific loaders extend this
 */
export class BaseLoader {
  constructor() {
    this.supportedExtensions = [];
  }

  /**
   * Check if loader supports a file
   */
  canLoad(filename) {
    const ext = this.getFileExtension(filename).toLowerCase();
    return this.supportedExtensions.includes(ext);
  }

  /**
   * Load file and return model
   * Must be implemented by subclasses
   */
  async load(file) {
    throw new Error('load() must be implemented by subclass');
  }

  /**
   * Validate file before loading
   */
  validate(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!(file instanceof File || file instanceof Blob)) {
      throw new Error('Invalid file type');
    }

    if (!this.canLoad(file.name)) {
      throw new Error(`Unsupported file format: ${file.name}`);
    }

    return true;
  }

  /**
   * Get file extension
   */
  getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }

  /**
   * Read file as array buffer
   */
  async readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Read file as text
   */
  async readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
}
