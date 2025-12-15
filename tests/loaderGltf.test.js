import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { loadAnyModel } from "../src/infrastructure/loaders/index.js";

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

// Minimal valid .gltf JSON with an empty default scene
const minimalGltf = JSON.stringify({
  asset: { version: "2.0" },
  scene: 0,
  scenes: [{ nodes: [] }],
  nodes: [],
});

describe("single-file loader - glTF (.gltf)", () => {
  it("parses minimal glTF and returns a Three root object", async () => {
    const gltfFile = makeFakeFile("minimal.gltf", minimalGltf);
    const { modelId, rootObject } = await loadAnyModel(gltfFile);
    expect(typeof modelId).toBe("string");
    expect(modelId.length).toBeGreaterThan(0);
    expect(rootObject).toBeInstanceOf(THREE.Object3D);
  });
});
