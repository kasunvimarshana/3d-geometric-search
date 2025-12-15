import { describe, it, expect, vi } from "vitest";
import * as THREE from "three";
import { ModelRegistry } from "../src/core/registry/ModelRegistry.js";

function makeMesh() {
  const geom = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  // Spy on dispose methods
  const gDispose = vi.spyOn(geom, "dispose");
  const mDispose = vi.spyOn(mat, "dispose");
  const mesh = new THREE.Mesh(geom, mat);
  return { mesh, gDispose, mDispose };
}

describe("ModelRegistry disposal", () => {
  it("disposes previous root resources on register()", () => {
    // First root with one mesh
    const root1 = new THREE.Group();
    const a = makeMesh();
    root1.add(a.mesh);

    // Attach to a parent to verify detach logic does not throw
    const parent = new THREE.Group();
    parent.add(root1);

    ModelRegistry.register("m1", root1);

    // Second root replaces the first
    const root2 = new THREE.Group();
    const b = makeMesh();
    root2.add(b.mesh);

    ModelRegistry.register("m2", root2);

    expect(a.gDispose).toHaveBeenCalled();
    expect(a.mDispose).toHaveBeenCalled();
    // Ensure registry now points to the new root
    expect(ModelRegistry.getRoot()).toBe(root2);
  });
});
