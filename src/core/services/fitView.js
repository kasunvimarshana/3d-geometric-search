import * as THREE from "three";

let cameraRef = null;
let controlsRef = null;

export function attachCameraAndControls(camera, controls) {
  cameraRef = camera;
  controlsRef = controls;
}

export function fitToObject(object3D) {
  if (!cameraRef || !controlsRef || !object3D) return;
  const box = new THREE.Box3().setFromObject(object3D);
  if (!box.isEmpty()) {
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.fov * (Math.PI / 180);
    const dist = maxDim / 2 / Math.tan(fov / 2);
    const dir = controlsRef.target.clone().sub(cameraRef.position).normalize();
    cameraRef.position.copy(center.clone().sub(dir.multiplyScalar(dist * 1.2)));
    controlsRef.target.copy(center);
    cameraRef.near = dist / 100;
    cameraRef.far = dist * 100;
    cameraRef.updateProjectionMatrix();
    controlsRef.update();
  }
}
