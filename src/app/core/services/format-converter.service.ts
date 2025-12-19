import { Injectable } from "@angular/core";
import * as THREE from "three";

export interface NormalizeOptions {
  unitScale?: number;
  center?: boolean;
}

@Injectable({ providedIn: "root" })
export class FormatConverterService {
  normalize(object: any, opts: NormalizeOptions = {}): any {
    const root = new THREE.Group();
    // Clone non-helper children into a clean group
    object.traverse((child: any) => {
      if (child.isLight || child.isHelper) return;
      if (child === object) return; // skip root itself; we'll add children below
    });
    // If the passed object has children, clone them, else clone object itself
    const toExport =
      object.children && object.children.length ? object : object.clone(true);
    const cloned = toExport.clone(true);

    // Apply scaling
    const scale = opts.unitScale ?? 1.0;
    if (scale !== 1.0) cloned.scale.setScalar(scale);

    // Center at origin
    if (opts.center) {
      const box = new THREE.Box3().setFromObject(cloned);
      const center = box.getCenter(new THREE.Vector3());
      cloned.position.sub(center);
    }

    root.add(cloned);
    return root;
  }

  async toGLTF(object: any, opts?: NormalizeOptions): Promise<Blob> {
    const normalized = this.normalize(object, opts);
    const mod: any = await import(
      "three/examples/jsm/exporters/GLTFExporter.js"
    );
    const exporter = new mod.GLTFExporter();
    return await new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        normalized,
        (result: ArrayBuffer | object) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: "model/gltf-binary" }));
          } else {
            const json = JSON.stringify(result);
            resolve(new Blob([json], { type: "model/gltf+json" }));
          }
        },
        (error: any) => reject(error),
        { binary: true }
      );
    });
  }

  async toOBJ(object: any, opts?: NormalizeOptions): Promise<Blob> {
    const normalized = this.normalize(object, opts);
    const mod: any = await import(
      "three/examples/jsm/exporters/OBJExporter.js"
    );
    const exporter = new mod.OBJExporter();
    const text = exporter.parse(normalized);
    return new Blob([text], { type: "model/obj" });
  }

  async toSTL(object: any, opts?: NormalizeOptions): Promise<Blob> {
    const normalized = this.normalize(object, opts);
    const mod: any = await import(
      "three/examples/jsm/exporters/STLExporter.js"
    );
    const exporter = new mod.STLExporter();
    const arrayBuffer = exporter.parse(normalized, {
      binary: true,
    }) as ArrayBuffer;
    return new Blob([arrayBuffer], { type: "model/stl" });
  }
}
