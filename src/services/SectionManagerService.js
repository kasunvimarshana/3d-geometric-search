/**
 * Section Manager Service - Manages sections, isolation, and highlighting
 * Following Single Responsibility Principle
 */

import * as THREE from 'three';
import { ISectionManager } from '../domain/models.js';
import { COLORS } from '../domain/constants.js';

export class SectionManagerService extends ISectionManager {
  constructor() {
    super();
    this.sections = new Map(); // sectionId -> Section
    this.meshMap = new Map(); // meshName -> THREE.Mesh
    this.originalMaterials = new Map(); // meshUuid -> original material
    this.sceneObject = null;
  }

  /**
   * Initialize with a loaded 3D object
   */
  initialize(sceneObject) {
    this.sceneObject = sceneObject;
    this.buildMeshMap(sceneObject);
  }

  /**
   * Build a map of all meshes in the scene
   */
  buildMeshMap(object) {
    this.meshMap.clear();
    this.originalMaterials.clear();

    object.traverse(child => {
      if (child.isMesh) {
        const meshName = child.name || child.uuid;
        this.meshMap.set(meshName, child);
        
        // Store original material
        if (child.material) {
          this.originalMaterials.set(child.uuid, child.material.clone());
        }
      }
    });
  }

  /**
   * Add a section
   */
  addSection(section) {
    this.sections.set(section.id, section);
  }

  /**
   * Get a section by ID
   */
  getSection(id) {
    return this.sections.get(id);
  }

  /**
   * Get all sections
   */
  getAllSections() {
    return Array.from(this.sections.values());
  }

  /**
   * Get root sections (sections without parents)
   */
  getRootSections() {
    return this.getAllSections().filter(section => !section.parent);
  }

  /**
   * Get child sections of a parent
   */
  getChildSections(parentId) {
    return this.getAllSections().filter(section => section.parent === parentId);
  }

  /**
   * Highlight a section
   */
  highlightSection(id, highlight = true) {
    const section = this.getSection(id);
    if (!section) return;

    section.isHighlighted = highlight;

    // Update mesh materials
    section.meshNames.forEach(meshName => {
      const mesh = this.meshMap.get(meshName);
      if (mesh) {
        if (highlight) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: COLORS.HIGHLIGHT,
            emissive: COLORS.HIGHLIGHT,
            emissiveIntensity: 0.3,
          });
        } else {
          // Restore original material
          const originalMaterial = this.originalMaterials.get(mesh.uuid);
          if (originalMaterial) {
            mesh.material = originalMaterial.clone();
          }
        }
      }
    });

    // Also highlight child sections
    section.children.forEach(childId => {
      this.highlightSection(childId, highlight);
    });
  }

  /**
   * Isolate a section (hide all other sections)
   */
  isolateSection(id) {
    const section = this.getSection(id);
    if (!section) return;

    // Mark the isolated section
    this.sections.forEach(s => {
      s.isIsolated = false;
    });
    section.isIsolated = true;

    // Hide all sections except the isolated one and its children
    const visibleSectionIds = this.getSectionAndDescendants(id);
    
    this.sections.forEach((s, sId) => {
      const shouldBeVisible = visibleSectionIds.has(sId);
      this.setSectionVisibility(sId, shouldBeVisible);
    });

    // Highlight the isolated section
    this.highlightSection(id, true);
  }

  /**
   * Get section and all its descendants
   */
  getSectionAndDescendants(id) {
    const result = new Set([id]);
    const section = this.getSection(id);
    
    if (section && section.children.length > 0) {
      section.children.forEach(childId => {
        const descendants = this.getSectionAndDescendants(childId);
        descendants.forEach(descId => result.add(descId));
      });
    }
    
    return result;
  }

  /**
   * Clear isolation and show all sections
   */
  clearIsolation() {
    this.sections.forEach(section => {
      section.isIsolated = false;
      section.isHighlighted = false;
      this.setSectionVisibility(section.id, true);
    });

    // Restore all original materials
    this.meshMap.forEach((mesh, meshName) => {
      const originalMaterial = this.originalMaterials.get(mesh.uuid);
      if (originalMaterial) {
        mesh.material = originalMaterial.clone();
      }
    });
  }

  /**
   * Set visibility of a section
   */
  setSectionVisibility(id, visible) {
    const section = this.getSection(id);
    if (!section) return;

    section.isVisible = visible;

    // Update mesh visibility
    section.meshNames.forEach(meshName => {
      const mesh = this.meshMap.get(meshName);
      if (mesh) {
        mesh.visible = visible;
      }
    });

    // Update child sections
    section.children.forEach(childId => {
      this.setSectionVisibility(childId, visible);
    });
  }

  /**
   * Toggle section visibility
   */
  toggleSectionVisibility(id) {
    const section = this.getSection(id);
    if (!section) return;

    this.setSectionVisibility(id, !section.isVisible);
  }

  /**
   * Clear all sections
   */
  clear() {
    this.sections.clear();
    this.meshMap.clear();
    this.originalMaterials.clear();
    this.sceneObject = null;
  }

  /**
   * Get section hierarchy as a tree structure
   */
  getSectionTree() {
    const roots = this.getRootSections();
    
    const buildTree = section => ({
      id: section.id,
      name: section.name,
      isVisible: section.isVisible,
      isHighlighted: section.isHighlighted,
      isIsolated: section.isIsolated,
      children: section.children.map(childId => {
        const child = this.getSection(childId);
        return child ? buildTree(child) : null;
      }).filter(Boolean),
    });

    return roots.map(buildTree);
  }
}
