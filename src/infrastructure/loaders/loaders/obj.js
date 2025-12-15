import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-stdlib";

export async function loadOBJ(arrayBuffer, name = "OBJ") {
  const text = new TextDecoder().decode(arrayBuffer);
  const loader = new OBJLoader();
  // Try to detect inlined MTL reference; in file uploads we may not have the MTL file. We still load geometry.
  const obj = loader.parse(text);
  const root = new THREE.Group();
  root.name = name;
  root.add(obj);
  return { rootObject: root };
}

// Load OBJ with accompanying MTL content and optional texture map.
// textureURLMap: Map of lowercased filename -> object URL for textures dropped alongside.
export async function loadOBJWithMTL(
  objText,
  mtlText,
  name = "OBJ",
  textureURLMap = new Map()
) {
  const manager = new THREE.LoadingManager();
  if (textureURLMap && textureURLMap.size) {
    manager.setURLModifier((url) => {
      const file = url.split(/[\\/]/).pop() || url;
      const key = file.toLowerCase();
      return textureURLMap.get(key) || url;
    });
  }

  const mtlLoader = new MTLLoader(manager);
  const materials = mtlLoader.parse(mtlText, "");
  materials.preload();

  const objLoader = new OBJLoader(manager);
  objLoader.setMaterials(materials);
  const obj = objLoader.parse(objText);

  const root = new THREE.Group();
  root.name = name;
  root.add(obj);
  return { rootObject: root };
}
