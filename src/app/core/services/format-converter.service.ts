import { Injectable } from "@angular/core";
import * as THREE from "three";

export interface NormalizeOptions {
  unitScale?: number;
  center?: boolean;
  binary?: boolean; // for GLTF/STL outputs where applicable
  embedImages?: boolean; // GLTF: embed textures into file
  onlyVisible?: boolean; // GLTF: export only visible objects
}

@Injectable({ providedIn: "root" })
export class FormatConverterService {
  normalize(object: any, opts: NormalizeOptions = {}): any {
    const root = new THREE.Group();
    // Clone the incoming object tree to avoid mutating the live scene
    const cloned = (object?.clone ? object.clone(true) : object) as any;

    // Apply scaling
    const scale = opts.unitScale ?? 1.0;
    if (scale !== 1.0) cloned.scale.setScalar(scale);

    // Center at origin
    if (opts.center) {
      const box = new THREE.Box3().setFromObject(cloned);
      const center = box.getCenter(new THREE.Vector3());
      cloned.position.sub(center);
    }

    // Ensure OBJ/STL include invisible parts when onlyVisible === false
    // Some exporters skip children with visible === false; if user wants all,
    // force everything visible in the normalized copy.
    if (opts.onlyVisible === false) {
      cloned.traverse((child: any) => {
        if (child && typeof child.visible === "boolean") child.visible = true;
      });
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
        {
          binary: opts?.binary !== false,
          embedImages: opts?.embedImages !== false,
          onlyVisible: opts?.onlyVisible !== false,
        }
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
      binary: opts?.binary !== false,
    }) as ArrayBuffer;
    return new Blob([arrayBuffer], { type: "model/stl" });
  }

  private dataUriToBlob(uri: string): { blob: Blob; ext: string } | null {
    if (!uri.startsWith("data:")) return null;
    const match = uri.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) return null;
    const mime = match[1];
    const b64 = match[2];
    const byteCharacters = atob(b64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });
    let ext = "bin";
    if (mime === "image/png") ext = "png";
    else if (mime === "image/jpeg" || mime === "image/jpg") ext = "jpg";
    else if (mime === "image/webp") ext = "webp";
    else if (mime === "image/ktx2") ext = "ktx2";
    return { blob, ext };
  }

  /**
   * Export GLTF as JSON with externalized buffers/images and return a package structure.
   * Only applicable when opts.binary === false.
   */
  async toGLTFPackage(
    object: any,
    opts?: NormalizeOptions
  ): Promise<{ gltf: string; assets: Array<{ name: string; blob: Blob }> }> {
    const normalized = this.normalize(object, opts);
    const mod: any = await import(
      "three/examples/jsm/exporters/GLTFExporter.js"
    );
    const exporter = new mod.GLTFExporter();
    const json: any = await new Promise<any>((resolve, reject) => {
      exporter.parse(
        normalized,
        (result: ArrayBuffer | object) => {
          if (result instanceof ArrayBuffer) {
            // Force JSON
            reject(new Error("toGLTFPackage requires JSON (binary=false)"));
          } else {
            resolve(result);
          }
        },
        (error: any) => reject(error),
        {
          binary: false,
          embedImages: opts?.embedImages === false ? false : false,
          onlyVisible: opts?.onlyVisible !== false,
        }
      );
    });

    const assets: Array<{ name: string; blob: Blob }> = [];

    // Externalize buffers
    if (Array.isArray(json.buffers)) {
      json.buffers.forEach((buf: any, i: number) => {
        if (typeof buf.uri === "string" && buf.uri.startsWith("data:")) {
          const out = this.dataUriToBlob(buf.uri);
          if (out) {
            const name = `buffer_${i}.bin`;
            assets.push({ name, blob: out.blob });
            buf.uri = name;
          }
        }
      });
    }

    // Externalize images
    if (Array.isArray(json.images)) {
      json.images.forEach((img: any, i: number) => {
        if (typeof img.uri === "string" && img.uri.startsWith("data:")) {
          const out = this.dataUriToBlob(img.uri);
          if (out) {
            const name = `image_${i}.${out.ext}`;
            assets.push({ name, blob: out.blob });
            img.uri = name;
          }
        }
      });
    }

    const gltf = JSON.stringify(json, null, 2);
    return { gltf, assets };
  }
}
