/**
 * Base Model Loader
 * Abstract base class for all format loaders
 */

import {
  createModel,
  createNode,
  NodeType,
  SupportedFormats,
} from "../core/types.js";

export class BaseLoader {
  constructor() {
    this.supportedFormats = [];
  }

  /**
   * Checks if loader supports a format
   * @param {string} format - File format
   * @returns {boolean}
   */
  supports(format) {
    return this.supportedFormats.includes(format.toLowerCase());
  }

  /**
   * Loads a 3D model from file
   * @param {File} file - File to load
   * @returns {Promise<Model3D>}
   */
  async load(file) {
    throw new Error("load() must be implemented by subclass");
  }

  /**
   * Parses file data
   * @param {ArrayBuffer|string} data - File data
   * @param {string} filename - File name
   * @returns {Promise<Object>}
   */
  async parse(data, filename) {
    throw new Error("parse() must be implemented by subclass");
  }

  /**
   * Reads file as ArrayBuffer
   * @param {File} file - File to read
   * @returns {Promise<ArrayBuffer>}
   */
  readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Reads file as text
   * @param {File} file - File to read
   * @returns {Promise<string>}
   */
  readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }
}
