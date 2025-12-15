/**
 * STEP Loader (Placeholder)
 * Note: Full STEP support requires specialized libraries like opencascade.js
 * This is a placeholder that provides basic structure
 */

import { BaseLoader } from "./BaseLoader.js";
import {
  createModel,
  createNode,
  NodeType,
  SupportedFormats,
} from "../core/types.js";

export class StepLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedFormats = [SupportedFormats.STEP, SupportedFormats.STP];
  }

  /**
   * Loads a STEP file
   * Note: This is a placeholder. Full implementation requires opencascade.js or similar
   * @param {File} file - File to load
   * @returns {Promise<Model3D>}
   */
  async load(file) {
    throw new Error(
      "STEP file support requires additional libraries (opencascade.js). " +
        "This format is not yet fully implemented in this demo. " +
        "Please use glTF/GLB, OBJ, or STL formats instead."
    );

    // Placeholder for future implementation:
    // const text = await this.readAsText(file);
    // const parsed = await this.parseSTEP(text);
    // return this.convertToModel(parsed, file.name);
  }

  /**
   * Placeholder for STEP parsing
   * Full implementation would use opencascade.js or similar CAD kernel
   */
  async parseSTEP(text) {
    // This would require a CAD kernel like:
    // - opencascade.js (WebAssembly port of Open CASCADE)
    // - Or server-side conversion service
    throw new Error("STEP parsing not implemented");
  }
}
