import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

/**
 * Viewer3D - A comprehensive 3D model viewer using Three.js
 *
 * Features:
 * - Multi-format support (glTF, OBJ, STL)
 * - Interactive camera controls
 * - Dynamic model scaling
 * - Wireframe mode
 * - Multiple viewing angles
 * - Grid and axes helpers
 * - Background color customization
 */
class Viewer3D {
  constructor(containerId) {
    // DOM container
    this.container = document.getElementById(containerId);

    // Three.js core components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    // Model and display state
    this.currentModel = null;
    this.wireframeMode = false;
    this.gridHelper = null;
    this.axesHelper = null;
    this.backgroundColors = [
      0x0f172a, // Dark blue (default)
      0x1a1a1a, // Almost black
      0x2d3748, // Slate
      0x1e3a8a, // Deep blue
      0x374151, // Gray
    ];
    this.currentBgIndex = 0;

    this.init();
    this.animate();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(5, 5, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 10, 7.5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    this.scene.add(directionalLight2);

    // Grid Helper (storedfor toggling)
    this.gridHelper = new THREE.GridHelper(20, 20, 0x475569, 0x334155);
    this.scene.add(this.gridHelper);

    // Axes Helper (stored for toggling)
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  clearModel() {
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.currentModel = null;
    }
  }

  loadModel(url, format) {
    this.clearModel();

    switch (format) {
      case "gltf":
      case "glb":
        this.loadGLTF(url);
        break;
      case "obj":
        this.loadOBJ(url);
        break;
      case "stl":
        this.loadSTL(url);
        break;
      default:
        this.loadDefaultModel();
    }
  }

  loadGLTF(url) {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this.currentModel = gltf.scene;
        this.currentModel.scale.set(0.1, 0.1, 0.1);
        this.scene.add(this.currentModel);
        this.fitCameraToObject(this.currentModel);
      },
      (progress) => {
        console.log("Loading:", (progress.loaded / progress.total) * 100 + "%");
      },
      (error) => {
        console.error("Error loading GLTF:", error);
        this.loadDefaultModel();
      }
    );
  }

  loadOBJ(url) {
    const loader = new OBJLoader();
    loader.load(
      url,
      (object) => {
        // Apply default material
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x2563eb,
              metalness: 0.3,
              roughness: 0.7,
            });
          }
        });

        this.currentModel = object;
        this.currentModel.scale.set(0.1, 0.1, 0.1);
        this.scene.add(this.currentModel);
        this.fitCameraToObject(this.currentModel);
      },
      (progress) => {
        console.log("Loading:", (progress.loaded / progress.total) * 100 + "%");
      },
      (error) => {
        console.error("Error loading OBJ:", error);
        this.loadDefaultModel();
      }
    );
  }

  loadSTL(url) {
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        const material = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          metalness: 0.3,
          roughness: 0.7,
        });

        const mesh = new THREE.Mesh(geometry, material);
        this.currentModel = mesh;
        this.currentModel.scale.set(0.1, 0.1, 0.1);
        this.scene.add(this.currentModel);
        this.fitCameraToObject(this.currentModel);
      },
      (progress) => {
        console.log("Loading:", (progress.loaded / progress.total) * 100 + "%");
      },
      (error) => {
        console.error("Error loading STL:", error);
        this.loadDefaultModel();
      }
    );
  }

  loadGeometryData(geometryData) {
    this.clearModel();

    if (
      !geometryData ||
      !geometryData.vertices ||
      geometryData.vertices.length === 0
    ) {
      this.loadDefaultModel();
      return;
    }

    // Create geometry from vertices and faces
    const geometry = new THREE.BufferGeometry();

    const positions = [];
    const normals = [];

    if (geometryData.faces && geometryData.faces.length > 0) {
      // Use face data
      for (const face of geometryData.faces) {
        for (const idx of face) {
          const v = geometryData.vertices[idx];
          positions.push(v.x, v.y, v.z);
        }
      }
    } else {
      // Use vertices directly
      for (const v of geometryData.vertices) {
        positions.push(v.x, v.y, v.z);
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.3,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.currentModel = mesh;
    this.scene.add(this.currentModel);
    this.fitCameraToObject(this.currentModel);
  }

  loadDefaultModel() {
    // Create a default cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.3,
      roughness: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.currentModel = mesh;
    this.scene.add(this.currentModel);
    this.resetCamera();
  }

  loadTemplateShape(shape) {
    this.clearModel();

    let geometry;

    switch (shape) {
      case "cube":
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(1.5, 32, 32);
        break;
      case "cylinder":
        geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(1, 2, 32);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        break;
      case "tetrahedron":
        geometry = new THREE.TetrahedronGeometry(1.5);
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.3,
      roughness: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.currentModel = mesh;
    this.scene.add(this.currentModel);
    this.resetCamera();
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;

    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.wireframe = this.wireframeMode;
        }
      });
    }
  }

  fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.5;

    this.camera.position.set(
      center.x + cameraDistance,
      center.y + cameraDistance,
      center.z + cameraDistance
    );

    this.controls.target.copy(center);
    this.controls.update();
  }

  resetCamera() {
    this.camera.position.set(5, 5, 5);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  zoomIn() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    const distance = this.camera.position.distanceTo(this.controls.target);
    const moveAmount = Math.max(distance * 0.2, 0.5);

    this.camera.position.addScaledVector(direction, moveAmount);
    this.controls.update();
  }

  zoomOut() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    const distance = this.camera.position.distanceTo(this.controls.target);
    const moveAmount = Math.max(distance * 0.5, 2);

    this.camera.position.addScaledVector(direction, -moveAmount);
    this.controls.update();
  }

  changeScale(delta) {
    if (!this.currentModel) return 0.1;

    const currentScale = this.currentModel.scale.x;
    const newScale = Math.max(0.01, Math.min(10, currentScale + delta));

    this.currentModel.scale.set(newScale, newScale, newScale);
    return newScale;
  }

  resetScale() {
    if (!this.currentModel) return 0.1;
    this.currentModel.scale.set(0.1, 0.1, 0.1);
    return 0.1;
  }

  // Camera View Presets
  setTopView() {
    const distance = this.camera.position.distanceTo(this.controls.target);
    this.camera.position.set(0, distance, 0);
    this.controls.update();
  }

  setFrontView() {
    const distance = this.camera.position.distanceTo(this.controls.target);
    this.camera.position.set(0, 0, distance);
    this.controls.update();
  }

  setSideView() {
    const distance = this.camera.position.distanceTo(this.controls.target);
    this.camera.position.set(distance, 0, 0);
    this.controls.update();
  }

  // Display Toggles
  toggleGrid() {
    if (this.gridHelper) {
      this.gridHelper.visible = !this.gridHelper.visible;
      return this.gridHelper.visible;
    }
    return false;
  }

  toggleAxes() {
    if (this.axesHelper) {
      this.axesHelper.visible = !this.axesHelper.visible;
      return this.axesHelper.visible;
    }
    return false;
  }

  cycleBackground() {
    this.currentBgIndex =
      (this.currentBgIndex + 1) % this.backgroundColors.length;
    this.scene.background = new THREE.Color(
      this.backgroundColors[this.currentBgIndex]
    );
  }

  screenshot() {
    return this.renderer.domElement.toDataURL("image/png");
  }
}

export default Viewer3D;
