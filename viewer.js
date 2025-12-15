import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class ModelViewer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentModel = null;
    this.grid = null;
    this.axes = null;
    this.lights = [];
    this.lightingMode = 0;
    this.shadowsEnabled = false;

    this.init();
    this.setupEventListeners();
    this.animate();

    // Auto-load the airplane model if available
    this.autoLoadDefaultModel();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 200);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 10);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    document
      .getElementById("canvas-container")
      .appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI;

    // Grid
    this.grid = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
    this.scene.add(this.grid);

    // Axes
    this.axes = new THREE.AxesHelper(10);
    this.scene.add(this.axes);

    // Lighting setup
    this.setupLighting();

    // Window resize handler
    window.addEventListener("resize", () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional light (Sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.6);
    this.scene.add(hemisphereLight);
    this.lights.push(hemisphereLight);

    // Point lights for accent
    const pointLight1 = new THREE.PointLight(0x6495ed, 0.5, 50);
    pointLight1.position.set(-10, 5, 0);
    this.scene.add(pointLight1);
    this.lights.push(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6495ed, 0.5, 50);
    pointLight2.position.set(10, 5, 0);
    this.scene.add(pointLight2);
    this.lights.push(pointLight2);
  }

  setupEventListeners() {
    const fileInput = document.getElementById("file-input");
    const renderMode = document.getElementById("render-mode");

    fileInput.addEventListener("change", (e) => this.handleFileUpload(e));
    renderMode.addEventListener("change", (e) =>
      this.changeRenderMode(e.target.value)
    );

    // Drag and drop
    const container = document.getElementById("canvas-container");
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleFileUpload({ target: { files: e.dataTransfer.files } });
    });
  }

  async handleFileUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    this.showLoading(true);

    try {
      // Find main model file and supporting files
      const objFile = files.find((f) => f.name.toLowerCase().endsWith(".obj"));
      const mtlFile = files.find((f) => f.name.toLowerCase().endsWith(".mtl"));
      const stlFile = files.find((f) => f.name.toLowerCase().endsWith(".stl"));
      const gltfFile = files.find((f) =>
        f.name.toLowerCase().endsWith(".gltf")
      );
      const glbFile = files.find((f) => f.name.toLowerCase().endsWith(".glb"));
      const textureFiles = files.filter((f) =>
        /\.(jpg|jpeg|png|bmp|gif)$/i.test(f.name)
      );

      if (objFile) {
        await this.loadOBJ(objFile, mtlFile, textureFiles);
      } else if (glbFile) {
        await this.loadGLTF(glbFile);
      } else if (gltfFile) {
        await this.loadGLTF(gltfFile);
      } else if (stlFile) {
        await this.loadSTL(stlFile);
      } else {
        alert("Please select a supported 3D model file (OBJ, STL, GLTF, GLB)");
      }
    } catch (error) {
      console.error("Error loading model:", error);
      alert("Error loading model: " + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  async loadOBJ(objFile, mtlFile, textureFiles) {
    return new Promise((resolve, reject) => {
      const objLoader = new OBJLoader();
      const mtlLoader = new MTLLoader();

      // Create texture map
      const textureMap = {};
      const texturePromises = textureFiles.map((file) => {
        return new Promise((resolveTexture) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            textureMap[file.name] = e.target.result;
            resolveTexture();
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(texturePromises).then(() => {
        if (mtlFile) {
          // Load MTL first
          const mtlReader = new FileReader();
          mtlReader.onload = (e) => {
            const mtlText = e.target.result;
            const materials = mtlLoader.parse(mtlText, "");

            // Apply textures from files
            Object.keys(materials.materials).forEach((matName) => {
              const material = materials.materials[matName];
              if (material.map) {
                const textureName = material.map.image;
                if (textureMap[textureName]) {
                  const texture = new THREE.TextureLoader().load(
                    textureMap[textureName]
                  );
                  texture.colorSpace = THREE.SRGBColorSpace;
                  material.map = texture;
                }
              }
            });

            materials.preload();
            objLoader.setMaterials(materials);

            // Load OBJ
            this.loadOBJFile(objFile, objLoader, resolve, reject);
          };
          mtlReader.readAsText(mtlFile);
        } else {
          // Load OBJ without materials
          this.loadOBJFile(objFile, objLoader, resolve, reject);
        }
      });
    });
  }

  loadOBJFile(objFile, loader, resolve, reject) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const object = loader.parse(e.target.result);
        this.addModelToScene(object);
        this.updateModelInfo(objFile.name, "OBJ");
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(objFile);
  }

  async loadSTL(stlFile) {
    return new Promise((resolve, reject) => {
      const loader = new STLLoader();
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const geometry = loader.parse(e.target.result);
          geometry.computeVertexNormals();

          const material = new THREE.MeshPhongMaterial({
            color: 0x6495ed,
            specular: 0x111111,
            shininess: 200,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          this.addModelToScene(mesh);
          this.updateModelInfo(stlFile.name, "STL");
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsArrayBuffer(stlFile);
    });
  }

  async loadGLTF(gltfFile) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          loader.parse(
            e.target.result,
            "",
            (gltf) => {
              this.addModelToScene(gltf.scene);
              this.updateModelInfo(gltfFile.name, "GLTF/GLB");
              resolve();
            },
            reject
          );
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsArrayBuffer(gltfFile);
    });
  }

  addModelToScene(object) {
    // Remove existing model
    if (this.currentModel) {
      this.scene.remove(this.currentModel);
      this.disposeObject(this.currentModel);
    }

    // Add new model
    this.currentModel = object;
    this.scene.add(object);

    // Center and scale model
    this.fitCameraToObject(object);

    // Enable shadows
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  fitCameraToObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the object
    object.position.sub(center);

    // Calculate optimal camera distance
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 2.5; // Zoom out a bit

    this.camera.position.set(cameraZ, cameraZ * 0.7, cameraZ);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  changeRenderMode(mode) {
    if (!this.currentModel) return;

    this.currentModel.traverse((child) => {
      if (child.isMesh) {
        switch (mode) {
          case "wireframe":
            child.material.wireframe = true;
            child.material.flatShading = false;
            break;
          case "flat":
            child.material.wireframe = false;
            child.material.flatShading = true;
            break;
          case "points":
            const pointsMaterial = new THREE.PointsMaterial({
              color: 0x6495ed,
              size: 0.1,
            });
            const points = new THREE.Points(child.geometry, pointsMaterial);
            child.parent.add(points);
            child.visible = false;
            break;
          default: // smooth
            child.material.wireframe = false;
            child.material.flatShading = false;
            child.visible = true;
        }
        child.material.needsUpdate = true;
      }
    });
  }

  resetCamera() {
    if (this.currentModel) {
      this.fitCameraToObject(this.currentModel);
    } else {
      this.camera.position.set(10, 10, 10);
      this.camera.lookAt(0, 0, 0);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  toggleGrid() {
    this.grid.visible = !this.grid.visible;
  }

  toggleAxes() {
    this.axes.visible = !this.axes.visible;
  }

  cycleLighting() {
    this.lightingMode = (this.lightingMode + 1) % 3;

    switch (this.lightingMode) {
      case 0: // Full lighting
        this.lights.forEach(
          (light) =>
            (light.intensity =
              light.userData.originalIntensity || light.intensity)
        );
        break;
      case 1: // Reduced lighting
        this.lights.forEach((light) => {
          light.userData.originalIntensity = light.intensity;
          light.intensity *= 0.5;
        });
        break;
      case 2: // Minimal lighting
        this.lights.forEach((light, i) => {
          if (i === 0) {
            // Keep ambient
            light.intensity = 0.3;
          } else {
            light.intensity = 0.2;
          }
        });
        break;
    }
  }

  toggleShadows() {
    this.shadowsEnabled = !this.shadowsEnabled;
    this.renderer.shadowMap.enabled = this.shadowsEnabled;

    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = this.shadowsEnabled;
          child.receiveShadow = this.shadowsEnabled;
        }
      });
    }
  }

  exportScreenshot() {
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `3d-model-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  updateModelInfo(filename, format) {
    let vertices = 0;
    let faces = 0;

    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child.isMesh && child.geometry) {
          const positions = child.geometry.attributes.position;
          if (positions) vertices += positions.count;

          const index = child.geometry.index;
          if (index) {
            faces += index.count / 3;
          } else if (positions) {
            faces += positions.count / 3;
          }
        }
      });
    }

    document.getElementById("model-info").innerHTML = `
            <strong>Model Loaded:</strong><br>
            📄 ${filename}<br>
            📦 Format: ${format}<br>
            🔺 Vertices: ${vertices.toLocaleString()}<br>
            ▲ Faces: ${Math.floor(faces).toLocaleString()}
        `;
  }

  showLoading(show) {
    document.getElementById("loading-overlay").style.display = show
      ? "flex"
      : "none";
  }

  async autoLoadDefaultModel() {
    // Auto-load the airplane model with all textures
    try {
      const objPath = "11803_Airplane_v1_l1.obj";
      const mtlPath = "11803_Airplane_v1_l1.mtl";

      this.showLoading(true);

      // Load MTL file first
      const mtlResponse = await fetch(mtlPath);
      if (!mtlResponse.ok) throw new Error("MTL file not found");

      const mtlText = await mtlResponse.text();
      const mtlLoader = new MTLLoader();
      const materials = mtlLoader.parse(mtlText, "");

      // Preload all textures referenced in MTL
      materials.preload();

      // Load OBJ file with materials
      const objResponse = await fetch(objPath);
      if (!objResponse.ok) throw new Error("OBJ file not found");

      const objText = await objResponse.text();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      const object = objLoader.parse(objText);

      // Ensure all meshes have proper material setup
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Ensure materials render correctly
          if (child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      });

      this.addModelToScene(object);
      this.updateModelInfo("11803_Airplane_v1_l1.obj (Default)", "OBJ");
      this.showLoading(false);

      console.log("✈️ Airplane model loaded successfully!");
    } catch (error) {
      console.log("Default airplane model not loaded:", error.message);
      this.showLoading(false);
      // Update info to show ready state
      document.getElementById("model-info").innerHTML = `
        <strong>Model Info:</strong><br>
        Ready to load a 3D model<br>
        <small style="color: #666;">Drag & drop or use file picker</small>
      `;
    }
  }

  disposeObject(object) {
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => this.disposeMaterial(material));
        } else {
          this.disposeMaterial(child.material);
        }
      }
    });
  }

  disposeMaterial(material) {
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.envMap) material.envMap.dispose();
    material.dispose();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize viewer
window.viewer = new ModelViewer();
