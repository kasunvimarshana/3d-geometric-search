import * as THREE from "three";

const _state = {
  modelId: null,
  root: null,
  nodeIndex: new Map(), // nodeId -> Object3D
  original: new Map(), // Object3D -> { position: Vector3, quaternion: Quaternion, scale: Vector3 }
  selectedNodeId: null,
  isolatedNodeId: null,
  highlighted: new Set(),
};

export const ModelRegistry = {
  register(modelId, rootObject) {
    // Detach and dispose previous root if present (prevents leaks and context loss)
    if (_state.root) {
      const prev = _state.root;
      // Detach from scene graph if attached
      try {
        prev.parent && prev.parent.remove(prev);
      } catch {}
      // Dispose geometries, materials and common texture maps
      try {
        const disposeMaterial = (m) => {
          if (!m) return;
          const maps = [
            "map",
            "normalMap",
            "roughnessMap",
            "metalnessMap",
            "aoMap",
            "emissiveMap",
            "displacementMap",
            "alphaMap",
            "lightMap",
            "bumpMap",
            "envMap",
          ];
          maps.forEach((k) => {
            try {
              m[k] && m[k].dispose && m[k].dispose();
            } catch {}
          });
          try {
            m.dispose && m.dispose();
          } catch {}
        };
        prev.traverse((o) => {
          if (o.isMesh) {
            try {
              o.geometry && o.geometry.dispose && o.geometry.dispose();
            } catch {}
            if (Array.isArray(o.material)) o.material.forEach(disposeMaterial);
            else disposeMaterial(o.material);
          }
        });
      } catch {}
      // Cleanup previous blob URLs if any
      if (prev.userData && Array.isArray(prev.userData.__blobUrls)) {
        try {
          prev.userData.__blobUrls.forEach((u) => URL.revokeObjectURL(u));
        } catch {}
        delete prev.userData.__blobUrls;
      }
    }
    _state.modelId = modelId;
    _state.root = rootObject;
    _state.nodeIndex.clear();
    _state.original.clear();
    _state.selectedNodeId = null;
    _state.isolatedNodeId = null;
    _state.highlighted.clear();
    let idCounter = 1;
    rootObject.traverse((obj) => {
      if (obj.isMesh || obj.isGroup || obj.isObject3D) {
        if (!obj.userData.__nodeId) obj.userData.__nodeId = `n${idCounter++}`;
        _state.nodeIndex.set(obj.userData.__nodeId, obj);
        _state.original.set(obj, {
          position: obj.position.clone(),
          quaternion: obj.quaternion.clone(),
          scale: obj.scale.clone(),
        });
      }
    });
  },
  getRoot() {
    return _state.root;
  },
  getSelectionOrRoot() {
    if (_state.selectedNodeId && _state.nodeIndex.has(_state.selectedNodeId)) {
      return _state.nodeIndex.get(_state.selectedNodeId);
    }
    return _state.root;
  },
  getById(nodeId) {
    return _state.nodeIndex.get(nodeId) || null;
  },
  select(nodeId) {
    _state.selectedNodeId = nodeId;
    this.highlight(nodeId ? [nodeId] : []);
  },
  isolate(nodeId) {
    _state.isolatedNodeId = nodeId;
    const target = this.getById(nodeId);
    if (!target) return;
    const visibleSet = new Set();
    target.traverse((o) => {
      visibleSet.add(o);
    });
    _state.root.traverse((o) => {
      o.visible = visibleSet.has(o);
    });
  },
  clearIsolation() {
    _state.isolatedNodeId = null;
    _state.root?.traverse((o) => {
      o.visible = true;
    });
  },
  highlight(nodeIds = []) {
    // Clear previous
    _state.root?.traverse((o) => {
      if (o.isMesh) {
        if (
          o.userData.__origEmissive === undefined &&
          o.material &&
          o.material.emissive
        ) {
          o.userData.__origEmissive = o.material.emissive.getHex();
        }
        if (o.material && o.material.emissive) {
          o.material.emissive.setHex(0x000000);
        }
      }
    });
    _state.highlighted = new Set(nodeIds);
    for (const id of _state.highlighted) {
      const obj = this.getById(id);
      if (!obj) continue;
      obj.traverse((o) => {
        if (o.isMesh && o.material && o.material.emissive) {
          o.material.emissive.setHex(0x1e90ff);
        }
      });
    }
  },
  refreshMaterials() {
    _state.root?.traverse((o) => {
      if (o.isMesh) {
        if (o.material) o.material.needsUpdate = true;
      }
    });
  },
  async disassemble(factor = 1) {
    if (!_state.root) return;
    const bbox = new THREE.Box3().setFromObject(_state.root);
    const center = bbox.getCenter(new THREE.Vector3());
    const tasks = [];
    _state.root.children.forEach((child, i) => {
      const cbox = new THREE.Box3().setFromObject(child);
      const dir = cbox.getCenter(new THREE.Vector3()).sub(center).normalize();
      if (!isFinite(dir.length()) || dir.length() === 0) dir.set(1, 0, 0);
      const distance =
        cbox.getSize(new THREE.Vector3()).length() * 0.5 * factor + (i % 5);
      const targetPos = _state.original
        .get(child)
        .position.clone()
        .add(dir.multiplyScalar(distance));
      tasks.push(animatePosition(child, targetPos, 350));
    });
    await Promise.all(tasks);
  },
  async reassemble() {
    if (!_state.root) return;
    const tasks = [];
    _state.root.children.forEach((child) => {
      const orig = _state.original.get(child);
      tasks.push(animatePosition(child, orig.position.clone(), 350));
    });
    await Promise.all(tasks);
  },
  resetTransforms() {
    _state.original.forEach((orig, obj) => {
      obj.position.copy(orig.position);
      obj.quaternion.copy(orig.quaternion);
      obj.scale.copy(orig.scale);
    });
  },
};

function animatePosition(obj, target, durationMs) {
  return new Promise((resolve) => {
    const start = obj.position.clone();
    const delta = target.clone().sub(start);
    const t0 = performance.now();
    function step() {
      const t = (performance.now() - t0) / durationMs;
      if (t >= 1) {
        obj.position.copy(target);
        resolve();
        return;
      }
      obj.position.copy(start).addScaledVector(delta, easeInOutCubic(t));
      requestAnimationFrame(step);
    }
    step();
  });
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
