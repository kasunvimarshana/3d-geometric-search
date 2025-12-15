import { IAnimationController } from "@domain/interfaces";
import { AnimationState } from "@domain/types";
import * as THREE from "three";

/**
 * Animation Controller
 * Manages model animations like disassembly and reassembly
 */
export class AnimationController implements IAnimationController {
  private meshes: Map<string, THREE.Object3D>;
  private originalPositions: Map<string, THREE.Vector3>;
  private animating: boolean;
  private currentState: AnimationState;

  constructor(_scene: THREE.Scene, meshes: Map<string, THREE.Object3D>) {
    // scene is kept for potential future use
    this.meshes = meshes;
    this.originalPositions = new Map();
    this.animating = false;
    this.currentState = AnimationState.ASSEMBLED;

    this.storeOriginalPositions();
  }

  private storeOriginalPositions(): void {
    this.meshes.forEach((mesh, id) => {
      this.originalPositions.set(id, mesh.position.clone());
    });
  }

  async disassemble(duration = 2000): Promise<void> {
    if (this.animating || this.currentState === AnimationState.DISASSEMBLED) {
      return;
    }

    this.animating = true;
    this.currentState = AnimationState.TRANSITIONING;

    const startTime = Date.now();
    const explosionFactor = 2.0;

    // Calculate center of model
    const box = new THREE.Box3();
    this.meshes.forEach((mesh) => {
      box.expandByObject(mesh);
    });
    const center = box.getCenter(new THREE.Vector3());

    return new Promise((resolve) => {
      const animate = (): void => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);

        this.meshes.forEach((mesh, id) => {
          const originalPos = this.originalPositions.get(id);
          if (!originalPos) return;

          const direction = originalPos.clone().sub(center).normalize();
          const distance = originalPos.distanceTo(center);
          const targetPos = originalPos
            .clone()
            .add(direction.multiplyScalar(distance * explosionFactor * eased));

          mesh.position.copy(targetPos);
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.animating = false;
          this.currentState = AnimationState.DISASSEMBLED;
          resolve();
        }
      };

      animate();
    });
  }

  async reassemble(duration = 2000): Promise<void> {
    if (this.animating || this.currentState === AnimationState.ASSEMBLED) {
      return;
    }

    this.animating = true;
    this.currentState = AnimationState.TRANSITIONING;

    const startTime = Date.now();
    const startPositions = new Map<string, THREE.Vector3>();

    this.meshes.forEach((mesh, id) => {
      startPositions.set(id, mesh.position.clone());
    });

    return new Promise((resolve) => {
      const animate = (): void => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);

        this.meshes.forEach((mesh, id) => {
          const startPos = startPositions.get(id);
          const originalPos = this.originalPositions.get(id);

          if (!startPos || !originalPos) return;

          mesh.position.lerpVectors(startPos, originalPos, eased);
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.animating = false;
          this.currentState = AnimationState.ASSEMBLED;
          resolve();
        }
      };

      animate();
    });
  }

  stop(): void {
    this.animating = false;
  }

  isAnimating(): boolean {
    return this.animating;
  }

  getState(): AnimationState {
    return this.currentState;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
