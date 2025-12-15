import * as THREE from "three";

let cameraRef = null;
let controlsRef = null;
let rafId = null;

function cancelActiveAnimation() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateTo(position, target, durationMs = 600) {
  if (!cameraRef || !controlsRef) return;
  cancelActiveAnimation();

  const startPos = cameraRef.position.clone();
  const startTgt = controlsRef.target.clone();
  const endPos = position.clone();
  const endTgt = target.clone();

  const startTime = performance.now();

  const step = () => {
    const now = performance.now();
    const t = Math.min(1, (now - startTime) / durationMs);
    const k = easeInOutCubic(t);

    cameraRef.position.lerpVectors(startPos, endPos, k);
    controlsRef.target.lerpVectors(startTgt, endTgt, k);
    controlsRef.update();

    if (t < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      cancelActiveAnimation();
    }
  };

  rafId = requestAnimationFrame(step);
}

export function attachCameraAndControls(camera, controls) {
  cameraRef = camera;
  controlsRef = controls;
}

export function fitToObject(object3D) {
  if (!cameraRef || !controlsRef || !object3D) return;
  const box = new THREE.Box3().setFromObject(object3D);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const radius = Math.max(sphere.radius, 1e-6);

  // Precise distance considering aspect ratio
  const aspect = cameraRef.aspect || 1;
  const vFov = (cameraRef.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distV = radius / Math.tan(vFov / 2);
  const distH = radius / Math.tan(hFov / 2);
  const dist = Math.max(distV, distH);

  const dir = controlsRef.target.clone().sub(cameraRef.position).normalize();

  const target = center.clone();
  const padding = 1.2;
  const desiredPos = center.clone().sub(dir.multiplyScalar(dist * padding));

  // Update clipping to comfortably include the whole model
  cameraRef.near = Math.max(0.001, radius / 100);
  cameraRef.far = Math.max(cameraRef.near + 1, radius * 100);
  cameraRef.updateProjectionMatrix();

  // Smooth, time-based transition for stability and comfort
  animateTo(desiredPos, target, 650);
}
