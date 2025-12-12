/**
 * Model Loader - Handles loading of various 3D file formats
 * Supports glTF/GLB, OBJ, STL, and planned STEP support
 *
 * @module ModelLoader
 * @version 1.1.0
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

export class ModelLoader {
  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.objLoader = new OBJLoader();
    this.stlLoader = new STLLoader();
  }

  /**
   * Load a 3D model file from various formats
   *
   * Automatically detects format from file extension and uses
   * appropriate loader. Returns standardized result object.
   *
   * @param {File} file - The file object to load
   * @returns {Promise<Object>} Promise resolving to {object, geometry}
   * @throws {Error} If file format is unsupported or loading fails
   */
  async loadModel(file) {
    return new Promise((resolve, reject) => {
      const fileName = file.name.toLowerCase();
      const reader = new FileReader();

      reader.onload = (event) => {
        const contents = event.target.result;

        try {
          if (fileName.endsWith(".gltf")) {
            this.loadGLTF(contents, resolve, reject, true);
          } else if (fileName.endsWith(".glb")) {
            this.loadGLB(contents, resolve, reject);
          } else if (fileName.endsWith(".obj")) {
            this.loadOBJ(contents, resolve, reject);
          } else if (fileName.endsWith(".stl")) {
            this.loadSTL(contents, resolve, reject);
          } else if (fileName.endsWith(".step") || fileName.endsWith(".stp")) {
            // STEP format requires specialized parser (opencascade.js)
            reject(
              new Error(
                "STEP format not yet supported. Please convert to glTF, GLB, OBJ, or STL format."
              )
            );
          } else {
            const ext = fileName.split(".").pop();
            reject(
              new Error(
                `Unsupported file format: .${ext}. Supported formats: .gltf, .glb, .obj, .stl`
              )
            );
          }
        } catch (error) {
          console.error("Model loading error:", error);
          reject(
            new Error(
              `Failed to load model: ${error.message || "Unknown error"}`
            )
          );
        }
      };

      reader.onerror = () =>
        reject(
          new Error(
            `Failed to read file: ${file.name}. The file may be corrupted or inaccessible.`
          )
        );

      // Read file based on format
      if (fileName.endsWith(".glb") || fileName.endsWith(".stl")) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }

  loadGLTF(contents, resolve, reject, isText = true) {
    try {
      const loader = new GLTFLoader();

      if (isText) {
        // Parse JSON text
        try {
          const data = JSON.parse(contents);
        } catch (error) {
          reject(new Error("Invalid glTF file: JSON parsing failed"));
          return;
        }
        loader.parse(
          contents,
          "",
          (gltf) => {
            if (!gltf || !gltf.scene) {
              reject(new Error("Invalid glTF file: No scene data found"));
              return;
            }
            resolve(this.processGLTFScene(gltf.scene));
          },
          (error) => {
            reject(
              new Error(
                `glTF loading failed: ${error.message || "Unknown error"}`
              )
            );
          }
        );
      }
    } catch (error) {
      reject(new Error(`glTF loading error: ${error.message}`));
    }
  }

  loadGLB(arrayBuffer, resolve, reject) {
    try {
      const loader = new GLTFLoader();
      loader.parse(
        arrayBuffer,
        "",
        (gltf) => {
          if (!gltf || !gltf.scene) {
            reject(new Error("Invalid GLB file: No scene data found"));
            return;
          }
          resolve(this.processGLTFScene(gltf.scene));
        },
        (error) => {
          reject(
            new Error(`GLB loading failed: ${error.message || "Unknown error"}`)
          );
        }
      );
    } catch (error) {
      reject(new Error(`GLB loading error: ${error.message}`));
    }
  }

  loadOBJ(contents, resolve, reject) {
    try {
      const loader = new OBJLoader();
      const object = loader.parse(contents);

      if (!object) {
        reject(new Error("OBJ loader returned null object"));
        return;
      }

      const result = this.processOBJScene(object);

      if (!result.geometry) {
        reject(new Error("No geometry found in OBJ file"));
        return;
      }

      resolve(result);
    } catch (error) {
      console.error("OBJ loading error:", error);
      reject(error);
    }
  }

  loadSTL(arrayBuffer, resolve, reject) {
    try {
      const loader = new STLLoader();
      const geometry = loader.parse(arrayBuffer);

      if (!geometry || !geometry.attributes || !geometry.attributes.position) {
        reject(new Error("Invalid STL file: No geometry data found"));
        return;
      }

      // Create mesh with material
      const material = new THREE.MeshPhongMaterial({
        color: 0x6699ff,
        specular: 0x111111,
        shininess: 200,
      });
      const mesh = new THREE.Mesh(geometry, material);

      resolve({
        object: mesh,
        geometry: geometry,
      });
    } catch (error) {
      reject(
        new Error(
          `STL loading failed: ${error.message || "Invalid file format"}`
        )
      );
    }
  }

  processGLTFScene(scene) {
    let mainGeometry = null;
    let mainObject = scene;

    // Find the first mesh with geometry
    scene.traverse((child) => {
      if (child.isMesh && child.geometry && !mainGeometry) {
        mainGeometry = child.geometry;
        mainObject = child;
      }
    });

    return {
      object: scene,
      geometry: mainGeometry,
    };
  }

  processOBJScene(object) {
    let mainGeometry = null;
    let mainObject = object;
    let meshCount = 0;

    // Find meshes and apply materials
    object.traverse((child) => {
      if (child.isMesh) {
        meshCount++;

        // Apply default material to all meshes if none exists
        if (
          !child.material ||
          (Array.isArray(child.material) && child.material.length === 0)
        ) {
          child.material = new THREE.MeshPhongMaterial({
            color: 0x6699ff,
            specular: 0x111111,
            shininess: 200,
          });
        }

        // Get the first valid geometry
        if (child.geometry && !mainGeometry) {
          mainGeometry = child.geometry;
          mainObject = child;
        }
      }
    });

    console.log(
      `OBJ processed: ${meshCount} meshes found, geometry:`,
      mainGeometry ? "Found" : "Not found"
    );

    return {
      object: object,
      geometry: mainGeometry,
    };
  }

  /**
   * Create thumbnail for a model
   */
  createThumbnail(object, width = 200, height = 150) {
    // Create temporary scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Clone and add object
    const clonedObject = object.clone();
    scene.add(clonedObject);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    // Calculate bounding box to position camera
    const box = new THREE.Box3().setFromObject(clonedObject);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5; // Add some margin

    camera.position.set(center.x, center.y, center.z + cameraZ);
    camera.lookAt(center);

    // Setup lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Render to canvas
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.render(scene, camera);

    const dataURL = renderer.domElement.toDataURL();

    // Cleanup
    renderer.dispose();

    return dataURL;
  }
}
