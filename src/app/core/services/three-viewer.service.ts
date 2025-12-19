import { Injectable } from "@angular/core";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

@Injectable({ providedIn: "root" })
export class ThreeViewerService {
  private renderer!: any;
  private scene!: any;
  private camera!: any;
  private controls!: any;
  private canvas!: HTMLCanvasElement;
  private frameId: number | null = null;

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
    const ext = file.name.toLowerCase().split(".").pop() || "";
    if (["gltf", "glb"].includes(ext)) return this.loadGLTF(file);
    if (ext === "obj") return this.loadOBJ(file);
    if (ext === "stl") return this.loadSTL(file);
    if (ext === "step" || ext === "stp") return this.loadSTEP(file);
    throw new Error(`Unsupported format: ${ext}`);
  }

  private async loadGLTF(file: File) {
    const url = URL.createObjectURL(file);
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    URL.revokeObjectURL(url);
    this.clearScene();
    this.scene.add(gltf.scene);
    this.fitToScreen();
  }

  private async loadOBJ(file: File) {
    const text = await file.text();
    const loader = new OBJLoader();
    const obj = loader.parse(text);
    this.clearScene();
    this.scene.add(obj);
    this.fitToScreen();
  }

  private async loadSTL(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const loader = new STLLoader();
    const geometry = loader.parse(arrayBuffer);
    const material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
    const mesh = new THREE.Mesh(geometry, material);
    this.clearScene();
    this.scene.add(mesh);
    this.fitToScreen();
  }

  private async loadSTEP(file: File) {
    // Placeholder: integrate WASM converter or server-side conversion to glTF
    console.warn("STEP loading requires converter. Using placeholder box.");
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
    const mesh = new THREE.Mesh(geom, mat);
    this.clearScene();
    this.scene.add(mesh);
    this.fitToScreen();
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

  resetView() {
    this.camera.position.set(2, 2, 2);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
