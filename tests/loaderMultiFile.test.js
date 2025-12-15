import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { loadAnyModelFromFiles } from "../src/infrastructure/loaders/index.js";

function makeFakeFile(name, text) {
  return {
    name,
    async arrayBuffer() {
      const enc = new TextEncoder();
      const u8 = enc.encode(text);
      return u8.buffer;
    },
  };
}

describe("multi-file loader", () => {
  it("pairs OBJ with MTL and returns a Three object", async () => {
    const objText = [
      "mtllib model.mtl",
      "o Triangle",
      "v 0 0 0",
      "v 1 0 0",
      "v 0 1 0",
      "usemtl material_0",
      "f 1 2 3",
    ].join("\n");

    const mtlText = [
      "newmtl material_0",
      "Ka 0.000 0.000 0.000",
      "Kd 0.640 0.640 0.640",
      "Ks 0.500 0.500 0.500",
      "d 1.0",
      "Ns 10.0",
      "illum 2",
    ].join("\n");

    const objFile = makeFakeFile("model.obj", objText);
    const mtlFile = makeFakeFile("model.mtl", mtlText);

    const { modelId, rootObject } = await loadAnyModelFromFiles([
      objFile,
      mtlFile,
    ]);
    expect(typeof modelId).toBe("string");
    expect(modelId.length).toBeGreaterThan(0);
    expect(rootObject).toBeInstanceOf(THREE.Object3D);
    expect(rootObject.children.length).toBeGreaterThan(0);
  });
});
