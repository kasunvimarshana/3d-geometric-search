/**
 * Scene Manager - High-level scene operations
 * Bridges domain models and 3D engine
 */
import * as THREE from 'three';

export class SceneManager {
  constructor(engine) {
    this.engine = engine;
    this.materialCache = new Map();
    this.sectionMeshMap = new Map(); // sectionId -> [meshIds]
  }

  /**
   * Load model into scene
   */
  loadModel(model) {
    this.clearScene();

    if (!model || !model.sections) {
      throw new Error('Invalid model');
    }

    model.getAllSections().forEach((section) => {
      this.loadSection(section);
    });

    this.engine.fitToScene();
  }

  /**
   * Load section into scene
   */
  loadSection(section) {
    if (!section.meshIds || section.meshIds.length === 0) {
      // Create default geometry for sections without explicit meshes
      this.createDefaultGeometry(section);
    }

    // Track section-to-mesh mapping
    if (!this.sectionMeshMap.has(section.id)) {
      this.sectionMeshMap.set(section.id, []);
    }
  }

  /**
   * Create default geometry for a section
   */
  createDefaultGeometry(section) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = this.getDefaultMaterial();
    const meshId = `mesh_${section.id}`;

    this.engine.addMesh(meshId, geometry, material);
    section.addMeshId(meshId);

    const meshIds = this.sectionMeshMap.get(section.id) || [];
    meshIds.push(meshId);
    this.sectionMeshMap.set(section.id, meshIds);
  }

  /**
   * Clear entire scene
   */
  clearScene() {
    this.engine.clearMeshes();
    this.sectionMeshMap.clear();
  }

  /**
   * Update section visibility
   */
  setSectionVisibility(sectionId, visible) {
    const meshIds = this.sectionMeshMap.get(sectionId);
    if (meshIds) {
      meshIds.forEach((meshId) => {
        const mesh = this.engine.getMesh(meshId);
        if (mesh) {
          mesh.visible = visible;
        }
      });
    }
  }

  /**
   * Highlight section
   */
  highlightSection(sectionId, highlight = true) {
    const meshIds = this.sectionMeshMap.get(sectionId);
    if (meshIds) {
      meshIds.forEach((meshId) => {
        const mesh = this.engine.getMesh(meshId);
        if (mesh) {
          if (highlight) {
            mesh.material = this.getHighlightMaterial();
          } else {
            mesh.material = this.getDefaultMaterial();
          }
        }
      });
    }
  }

  /**
   * Select section
   */
  selectSection(sectionId, selected = true) {
    const meshIds = this.sectionMeshMap.get(sectionId);
    if (meshIds) {
      meshIds.forEach((meshId) => {
        const mesh = this.engine.getMesh(meshId);
        if (mesh) {
          if (selected) {
            mesh.material = this.getSelectionMaterial();
          } else {
            mesh.material = this.getDefaultMaterial();
          }
        }
      });
    }
  }

  /**
   * Isolate section (hide all others)
   */
  isolateSection(sectionId) {
    this.sectionMeshMap.forEach((meshIds, id) => {
      const visible = id === sectionId;
      this.setSectionVisibility(id, visible);
    });
  }

  /**
   * Show all sections
   */
  showAllSections() {
    this.sectionMeshMap.forEach((meshIds, id) => {
      this.setSectionVisibility(id, true);
    });
  }

  /**
   * Focus on section
   */
  focusOnSection(sectionId) {
    const meshIds = this.sectionMeshMap.get(sectionId);
    if (meshIds && meshIds.length > 0) {
      const meshId = meshIds[0];
      const mesh = this.engine.getMesh(meshId);
      if (mesh) {
        this.engine.fitToObject(mesh);
      }
    }
  }

  /**
   * Disassemble model (spread sections apart)
   */
  disassemble(model, distance = 2) {
    const sections = model.getAllSections();
    sections.forEach((section, index) => {
      const meshIds = this.sectionMeshMap.get(section.id);
      if (meshIds) {
        meshIds.forEach((meshId) => {
          const mesh = this.engine.getMesh(meshId);
          if (mesh) {
            const angle = (index / sections.length) * Math.PI * 2;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            mesh.position.set(x, 0, z);
          }
        });
      }
    });
  }

  /**
   * Reassemble model (return to original positions)
   */
  reassemble() {
    this.sectionMeshMap.forEach((meshIds) => {
      meshIds.forEach((meshId) => {
        const mesh = this.engine.getMesh(meshId);
        if (mesh) {
          mesh.position.set(0, 0, 0);
        }
      });
    });
  }

  /**
   * Material getters with caching
   */
  getDefaultMaterial() {
    if (!this.materialCache.has('default')) {
      this.materialCache.set(
        'default',
        new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 0.2,
          roughness: 0.6,
        })
      );
    }
    return this.materialCache.get('default');
  }

  getHighlightMaterial() {
    if (!this.materialCache.has('highlight')) {
      this.materialCache.set(
        'highlight',
        new THREE.MeshStandardMaterial({
          color: 0xffaa00,
          metalness: 0.3,
          roughness: 0.4,
          emissive: 0xff8800,
          emissiveIntensity: 0.3,
        })
      );
    }
    return this.materialCache.get('highlight');
  }

  getSelectionMaterial() {
    if (!this.materialCache.has('selection')) {
      this.materialCache.set(
        'selection',
        new THREE.MeshStandardMaterial({
          color: 0x4488ff,
          metalness: 0.3,
          roughness: 0.4,
          emissive: 0x2266dd,
          emissiveIntensity: 0.4,
        })
      );
    }
    return this.materialCache.get('selection');
  }

  /**
   * Get section by raycasting
   */
  getSectionAtPoint(x, y) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, this.engine.camera);

    const meshes = Array.from(this.engine.meshMap.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      // Find section ID from mesh
      for (const [sectionId, meshIds] of this.sectionMeshMap.entries()) {
        if (meshIds.includes(mesh.userData.meshId)) {
          return sectionId;
        }
      }
    }

    return null;
  }

  /**
   * Cleanup
   */
  dispose() {
    this.materialCache.forEach((material) => material.dispose());
    this.materialCache.clear();
    this.sectionMeshMap.clear();
  }
}
