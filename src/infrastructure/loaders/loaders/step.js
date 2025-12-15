import * as THREE from "three";

// STEP via OpenCascade WebAssembly (occt-import-js)
export async function loadSTEP(arrayBuffer, name = "STEP") {
  let occt;
  try {
    const modName = "occt-import-js";
    // Avoid Vite pre-bundling resolution when not installed
    occt = await import(/* @vite-ignore */ modName);
  } catch (e) {
    throw new Error(
      "STEP support requires occt-import-js. Install with: npm install occt-import-js"
    );
  }
  const { readStepFile } = occt;
  const result = await readStepFile(new Uint8Array(arrayBuffer));
  const root = new THREE.Group();
  root.name = name;
  // Convert each mesh to Three.js
  for (const m of result.meshes) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(m.attributes.position.array),
        3
      )
    );
    if (m.attributes.normal) {
      geometry.setAttribute(
        "normal",
        new THREE.BufferAttribute(
          new Float32Array(m.attributes.normal.array),
          3
        )
      );
    } else {
      geometry.computeVertexNormals();
    }
    const material = new THREE.MeshStandardMaterial({
      color: 0x9aa3b2,
      metalness: 0.1,
      roughness: 0.75,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = m.name || "STEPPart";
    root.add(mesh);
  }
  return { rootObject: root };
}
