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
    onProgress?.(0);
    // Try dynamic import of a WASM-based STEP converter if available.
    try {
      const buffer = await file.arrayBuffer();
      // Attempt known module IDs in order; ignore failures and fall back.
      const candidates = [
        "occt-import-js",
        "@sahriai/occt-import-js",
        "wasm-step-converter",
      ];
      for (const id of candidates) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const mod: any = await import(/* webpackIgnore: true */ id);
          const fn =
            mod?.convertStepToObject3D ||
            mod?.ConvertStepToObject3D ||
            mod?.convert;
          if (typeof fn === "function") {
            onProgress?.(5);
            const obj = await fn(buffer, (p: number) => onProgress?.(p));
            if (obj) {
              obj.name = file.name;
              onProgress?.(100);
              return obj;
            }
          }
        } catch {
          // continue to next candidate
        }
      }
    } catch {
      // ignore and fall through to placeholder
    }

    // Fallback: simulate staged progress and return a simple mesh
    const stages = [5, 20, 45, 70, 90, 100];
    for (const p of stages) {
      await new Promise((r) => setTimeout(r, 80));
      onProgress?.(p);
    }
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = file.name;
    return mesh;
  }
}
