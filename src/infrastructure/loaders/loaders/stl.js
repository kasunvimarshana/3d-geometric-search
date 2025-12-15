import * as THREE from "three";
import { STLLoader } from "three-stdlib";

export async function loadSTL(arrayBuffer, name = "STL") {
  const loader = new STLLoader();
  const geometry = loader.parse(arrayBuffer);
  const material = new THREE.MeshStandardMaterial({
    color: 0xb0b8c3,
    metalness: 0.1,
    roughness: 0.7,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  const root = new THREE.Group();
  root.add(mesh);
  root.name = name;
  return { rootObject: root };
}
