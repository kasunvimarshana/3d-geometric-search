import * as THREE from 'three';

/**
 * ModelRenderer
 *
 * Handles rendering of model sections including highlighting,
 * selection visualization, and material management.
 */
export class ModelRenderer {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.sectionObjects = new Map();
    this.originalMaterials = new Map();

    // Define materials
    this.materials = {
      default: new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        side: THREE.DoubleSide,
      }),
      selected: new THREE.MeshPhongMaterial({
        color: 0x4a90e2,
        emissive: 0x2a5a92,
        side: THREE.DoubleSide,
      }),
      highlighted: new THREE.MeshPhongMaterial({
        color: 0xffaa00,
        emissive: 0xaa6600,
        side: THREE.DoubleSide,
      }),
      focused: new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x009900,
        side: THREE.DoubleSide,
      }),
      wireframe: new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
      }),
    };
  }

  /**
   * Render model sections
   */
  renderModel(model, object3D) {
    this.clearRenderData();

    // Store section mappings
    object3D.traverse((object) => {
      if (object.userData.sectionId) {
        this.sectionObjects.set(object.userData.sectionId, object);

        // Store original material
        if (object.material) {
          this.originalMaterials.set(object.userData.sectionId, object.material.clone());
        }
      }
    });

    this.sceneManager.addModel(object3D);
  }

  /**
   * Highlight sections
   */
  highlightSections(sectionIds) {
    sectionIds.forEach((id) => {
      const object = this.sectionObjects.get(id);
      if (object && object.material) {
        object.material = this.materials.highlighted;
      }
    });
  }

  /**
   * Dehighlight sections
   */
  dehighlightSections(sectionIds) {
    sectionIds.forEach((id) => {
      const object = this.sectionObjects.get(id);
      if (object) {
        const originalMaterial = this.originalMaterials.get(id);
        if (originalMaterial) {
          object.material = originalMaterial;
        }
      }
    });
  }

  /**
   * Select sections
   */
  selectSections(sectionIds) {
    sectionIds.forEach((id) => {
      const object = this.sectionObjects.get(id);
      if (object && object.material) {
        object.material = this.materials.selected;
      }
    });
  }

  /**
   * Deselect sections
   */
  deselectSections(sectionIds) {
    sectionIds.forEach((id) => {
      const object = this.sectionObjects.get(id);
      if (object) {
        const originalMaterial = this.originalMaterials.get(id);
        if (originalMaterial) {
          object.material = originalMaterial;
        }
      }
    });
  }

  /**
   * Focus on section
   */
  focusSection(sectionId) {
    const object = this.sectionObjects.get(sectionId);
    if (object && object.material) {
      object.material = this.materials.focused;
    }
  }

  /**
   * Clear focus
   */
  clearFocus() {
    this.sectionObjects.forEach((object, id) => {
      const originalMaterial = this.originalMaterials.get(id);
      if (originalMaterial) {
        object.material = originalMaterial;
      }
    });
  }

  /**
   * Set sections visibility
   */
  setSectionsVisibility(sectionIds, visible) {
    sectionIds.forEach((id) => {
      const object = this.sectionObjects.get(id);
      if (object) {
        object.visible = visible;
      }
    });
  }

  /**
   * Isolate sections
   */
  isolateSections(sectionIds) {
    const isolatedSet = new Set(sectionIds);

    this.sectionObjects.forEach((object, id) => {
      object.visible = isolatedSet.has(id);
    });
  }

  /**
   * Clear isolation
   */
  clearIsolation() {
    this.sectionObjects.forEach((object) => {
      object.visible = true;
    });
  }

  /**
   * Set wireframe mode
   */
  setWireframeMode(enabled) {
    this.sectionObjects.forEach((object) => {
      if (object.material) {
        object.material.wireframe = enabled;
      }
    });
  }

  /**
   * Get section object
   */
  getSectionObject(sectionId) {
    return this.sectionObjects.get(sectionId);
  }

  /**
   * Get all section objects
   */
  getAllSectionObjects() {
    return Array.from(this.sectionObjects.values());
  }

  /**
   * Clear render data
   */
  clearRenderData() {
    this.sectionObjects.clear();
    this.originalMaterials.clear();
  }

  /**
   * Dispose materials
   */
  dispose() {
    Object.values(this.materials).forEach((material) => material.dispose());
    this.originalMaterials.forEach((material) => material.dispose());
    this.clearRenderData();
  }
}
