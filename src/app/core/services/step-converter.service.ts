import { Injectable } from "@angular/core";
import * as THREE from "three";
import { appConfig } from "../config";

@Injectable({ providedIn: "root" })
export class StepConverterService {
  /**
   * Placeholder STEP -> Object3D conversion.
   * Integrate a real converter (WASM/server) and emit progress via callback.
   */
  async convertToObject3D(
    file: File,
    onProgress?: (progress: number) => void,
    opts?: { signal?: AbortSignal }
  ): Promise<any> {
    onProgress?.(0);
    const signal = opts?.signal;

    const isAborted = () => !!signal?.aborted;
    const throwIfAborted = () => {
      if (isAborted()) {
        throw new Error("STEP conversion cancelled");
      }
    };

    throwIfAborted();
    // Optional: use a globally provided converter without importing modules
    // Attach a converter at runtime via `window.STEP_CONVERTER(buffer, onProgress, { signal })`
    if (appConfig.step.useWasm) {
      try {
        const buffer = await file.arrayBuffer();
        throwIfAborted();
        const globalAny: any = window as any;
        const fn =
          globalAny?.STEP_CONVERTER || globalAny?.convertStepToObject3D;
        if (typeof fn === "function") {
          onProgress?.(5);
          const obj = await fn(buffer, (p: number) => onProgress?.(p), {
            signal,
          });
          if (obj) {
            obj.name = file.name;
            onProgress?.(100);
            return obj;
          }
        }
      } catch {
        // ignore and fall through to placeholder
      }
    }

    // Fallback: simulate staged progress and return a simple mesh
    const stages = [5, 20, 45, 70, 90, 100];
    for (const p of stages) {
      throwIfAborted();
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
