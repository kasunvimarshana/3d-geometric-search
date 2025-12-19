import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { StepConverterService } from "./step-converter.service";

@Injectable({ providedIn: "root" })
export class ThreeViewerService {
  private renderer!: any;
  private scene!: any;
  private camera!: any;
  private controls!: any;
  private canvas!: HTMLCanvasElement;
  private frameId: number | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private objectIndex = new Map<string, any>();
  private isolatedId: string | null = null;
  private isCancelled = false;
  private currentReader: FileReader | null = null;
  private currentAbort: AbortController | null = null;

  readonly pickedObject$ = new Subject<string>();
  readonly loadProgress$ = new Subject<number>();

  constructor(private stepConverter: StepConverterService) {}

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f1115);

    const fov = 60;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.01, 10000);
    this.camera.position.set(2, 2, 2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    this.scene.add(ambient, dir);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;

    window.addEventListener("resize", () => this.onResize());
    this.canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
  }

  start() {
    const loop = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(loop);
    };
    loop();
  }

  dispose() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.scene.clear();
    // Note: OrbitControls disposes via event removal if needed
  }

  private onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  async loadFile(file: File) {
    this.isCancelled = false;
    const ext = file.name.toLowerCase().split(".").pop() || "";
    if (["gltf", "glb"].includes(ext)) return this.loadGLTF(file);
    if (ext === "obj") return this.loadOBJ(file);
    if (ext === "stl") return this.loadSTL(file);
    if (ext === "step" || ext === "stp") return this.loadSTEP(file);
    throw new Error(`Unsupported format: ${ext}`);
  }

  async loadFiles(files: File[]) {
    const byExt = (ext: string) =>
      files.find((f) => f.name.toLowerCase().endsWith(`.${ext}`));
    const glb = byExt("glb");
    const gltf = byExt("gltf");
    const obj = byExt("obj");
    const mtl = byExt("mtl");
    const stl = byExt("stl");
    const step = files.find((f) => /\.(step|stp)$/i.test(f.name));

    if (glb) return this.loadGLTF(glb);
    if (gltf) return this.loadGLTF(gltf);
    if (obj) {
      if (mtl) return this.loadOBJWithMTL(obj, mtl);
      return this.loadOBJ(obj);
    }
    if (stl) return this.loadSTL(stl);
    if (step) return this.loadSTEP(step);
    if (files.length === 1) return this.loadFile(files[0]);
    throw new Error("No supported files found");
  }

  private emitProgress(p: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(p)));
    this.loadProgress$.next(clamped);
  }

  private createLoadingManager(): any {
    const manager = new THREE.LoadingManager();
    manager.onStart = () => this.emitProgress(0);
    manager.onProgress = (_item: string, loaded: number, total: number) => {
      const pct = (loaded / Math.max(total, 1)) * 100;
      this.emitProgress(pct);
    };
    manager.onLoad = () => this.emitProgress(100);
    return manager;
  }

  private async loadGLTF(file: File) {
    const url = URL.createObjectURL(file);
    const loader = new GLTFLoader(this.createLoadingManager());
    this.emitProgress(0);
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.load(
        url,
        (g: any) => resolve(g),
        (evt: ProgressEvent) => {
          if (evt.lengthComputable) {
            const pct = (evt.loaded / evt.total) * 100;
            this.emitProgress(pct);
          }
        },
        (err: any) => reject(err)
      );
    });
    URL.revokeObjectURL(url);
    if (this.isCancelled) return;
    this.clearScene();
    this.scene.add(gltf.scene);
    this.indexSceneObjects();
    this.fitToScreen();
    this.emitProgress(100);
  }

  private async loadOBJ(file: File) {
    await new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      this.currentReader = reader;
      reader.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = (evt.loaded / evt.total) * 100;
          this.emitProgress(pct);
        }
      };
      reader.onload = () => {
        const text = reader.result as string;
        const loader = new OBJLoader();
        const obj = loader.parse(text);
        if (this.isCancelled) {
          resolve();
          return;
        }
        this.clearScene();
        this.scene.add(obj);
        this.indexSceneObjects();
        this.fitToScreen();
        this.emitProgress(100);
        resolve();
      };
      reader.onerror = () => reject(reader.error);
      this.emitProgress(0);
      reader.readAsText(file);
    });
    this.currentReader = null;
  }

  private async loadOBJWithMTL(objFile: File, mtlFile: File) {
    this.emitProgress(0);
    const [objText, mtlText] = await Promise.all([
      objFile.text(),
      mtlFile.text(),
    ]);
    this.emitProgress(50);
    const mtlLoader = new MTLLoader();
    const materials = mtlLoader.parse(mtlText, "");
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    const obj = objLoader.parse(objText);
    if (this.isCancelled) return;
    this.clearScene();
    this.scene.add(obj);
    this.indexSceneObjects();
    this.fitToScreen();
    this.emitProgress(100);
  }

  private async loadSTL(file: File) {
    await new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      this.currentReader = reader;
      reader.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = (evt.loaded / evt.total) * 100;
          this.emitProgress(pct);
        }
      };
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer);
        const material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        const mesh = new THREE.Mesh(geometry, material);
        if (this.isCancelled) {
          resolve();
          return;
        }
        this.clearScene();
        this.scene.add(mesh);
        this.indexSceneObjects();
        this.fitToScreen();
        this.emitProgress(100);
        resolve();
      };
      reader.onerror = () => reject(reader.error);
      this.emitProgress(0);
      reader.readAsArrayBuffer(file);
    });
    this.currentReader = null;
  }

  private async loadSTEP(file: File) {
    this.clearScene();
    this.loadProgress$.next(0);
    const abort = new AbortController();
    this.currentAbort = abort;
    let obj: any;
    try {
      obj = await this.stepConverter.convertToObject3D(
        file,
        (p) => {
          this.loadProgress$.next(p);
        },
        { signal: abort.signal }
      );
    } catch {
      // Swallow errors on cancel; keep service consistent
      this.currentAbort = null;
      return;
    }
    this.currentAbort = null;
    if (this.isCancelled || abort.signal.aborted) return;
    this.scene.add(obj);
    this.indexSceneObjects();
    this.fitToScreen();
    this.loadProgress$.next(100);
  }

  clearScene() {
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
    }
  }

  fitToScreen() {
    const box = new THREE.Box3().setFromObject(this.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fitOffset = 1.4;

    const fov = this.camera.fov * (Math.PI / 180);
    let distance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    distance *= fitOffset;

    const direction = new THREE.Vector3(1, 1, 1).normalize();
    const newPos = center.clone().add(direction.multiplyScalar(distance));
    this.camera.position.copy(newPos);
    this.camera.near = maxDim / 100;
    this.camera.far = maxDim * 100;
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(center);
    this.controls.update();
  }

  fitToObject(id: string) {
    const obj = this.objectIndex.get(id);
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fitOffset = 1.4;
    const fov = this.camera.fov * (Math.PI / 180);
    let distance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    distance *= fitOffset;
    const direction = new THREE.Vector3(1, 1, 1).normalize();
    const newPos = center.clone().add(direction.multiplyScalar(distance));
    this.camera.position.copy(newPos);
    this.camera.near = maxDim / 100;
    this.camera.far = maxDim * 100;
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(center);
    this.controls.update();
  }

  highlightById(id: string) {
    const obj = this.objectIndex.get(id);
    if (!obj) return;
    obj.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => {
            if (m.emissive) m.emissive.setHex(0x3b82f6);
          });
        } else if (child.material.emissive) {
          child.material.emissive.setHex(0x3b82f6);
        }
      }
    });
  }

  clearHighlight() {
    this.scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => {
            if (m.emissive) m.emissive.setHex(0x000000);
          });
        } else if (child.material.emissive) {
          child.material.emissive.setHex(0x000000);
        }
      }
    });
  }

  isolateById(id: string) {
    const target = this.objectIndex.get(id);
    if (!target) return;
    this.isolatedId = id;
    this.scene.traverse((obj: any) => {
      if (obj === target) {
        obj.visible = true;
      } else if (obj.isObject3D) {
        obj.visible = false;
      }
    });
  }

  clearIsolation() {
    this.isolatedId = null;
    this.scene.traverse((obj: any) => {
      if (obj.isObject3D) obj.visible = true;
    });
  }

  private indexSceneObjects() {
    this.objectIndex.clear();
    if (!this.scene) return;
    this.scene.traverse((obj: any) => {
      if ((obj.isMesh || obj.isGroup || obj.isObject3D) && obj.uuid) {
        this.objectIndex.set(obj.uuid, obj);
      }
    });
  }

  buildSectionTree(): { id: string; name: string; children?: any[] }[] {
    if (!this.scene) return [];
    const build = (obj: any): any => {
      const node = {
        id: obj.uuid,
        name: obj.name || obj.type,
        children: [] as any[],
      };
      if (obj.children && obj.children.length) {
        for (const child of obj.children) {
          if (child.isLight || child.isHelper) continue;
          node.children!.push(build(child));
        }
      }
      return node;
    };
    return [build(this.scene)];
  }

  private onPointerDown(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    this.pointer.set(x, y);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );
    if (intersects && intersects.length) {
      const obj = intersects[0].object;
      const id = obj.uuid;
      if (id) this.pickedObject$.next(id);
    }
  }

  zoom(delta: number) {
    this.camera.position.multiplyScalar(1 + delta);
    this.controls.update();
  }

  setFullScreen() {
    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  cancelLoad() {
    this.isCancelled = true;
    if (this.currentReader) {
      try {
        this.currentReader.abort();
      } catch {}
    }
    if (this.currentAbort) {
      try {
        this.currentAbort.abort();
      } catch {}
    }
  }

  getRootObject(): any {
    return this.scene;
  }

  getObjectById(id: string): any | undefined {
    return this.objectIndex.get(id);
  }

  resetView() {
    this.camera.position.set(2, 2, 2);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
