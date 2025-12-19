import { Injectable } from "@angular/core";
import * as THREE from "three";

@Injectable({ providedIn: "root" })
export class StepConverterService {
  /**
   * Placeholder STEP -> Object3D conversion.
   * Integrate a real converter (WASM/server) and emit progress via callback.
   */
  async convertToObject3D(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    // Simulate staged progress while "converting"
    const stages = [5, 20, 45, 70, 90, 100];
    for (const p of stages) {
      await new Promise((r) => setTimeout(r, 80));
      onProgress?.(p);
    }

    // Placeholder: return a simple mesh
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = file.name;
    return mesh;
  }
}
