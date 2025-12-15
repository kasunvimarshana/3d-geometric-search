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
