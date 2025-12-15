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

// Minimal ASCII STL with one triangle
const asciiStl = [
  "solid triangle",
  "facet normal 0 0 1",
  "  outer loop",
  "    vertex 0 0 0",
  "    vertex 1 0 0",
  "    vertex 0 1 0",
  "  endloop",
  "endfacet",
  "endsolid triangle",
].join("\n");

describe("single-file loader - STL (.stl)", () => {
  it("parses ASCII STL and returns a Three root object", async () => {
    const stlFile = makeFakeFile("tri.stl", asciiStl);
    const { modelId, rootObject } = await loadAnyModel(stlFile);
    expect(typeof modelId).toBe("string");
    expect(modelId.length).toBeGreaterThan(0);
    expect(rootObject).toBeInstanceOf(THREE.Object3D);
    expect(rootObject.children.length).toBeGreaterThan(0);
  });
});
