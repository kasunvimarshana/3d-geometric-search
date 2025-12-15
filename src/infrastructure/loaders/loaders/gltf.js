import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export async function loadGLTF(data, name = "GLTF", manager) {
  const loader = new GLTFLoader(manager);
  const gltf = await loader.parseAsync(data, "");
  const root = new THREE.Group();
  root.name = name;
  root.add(gltf.scene);
  return { rootObject: root };
}
