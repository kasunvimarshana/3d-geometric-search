import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export async function loadGLTF(arrayBuffer, name = "GLTF") {
  const loader = new GLTFLoader();
  const gltf = await loader.parseAsync(arrayBuffer, "");
  const root = new THREE.Group();
  root.name = name;
  root.add(gltf.scene);
  return { rootObject: root };
}
