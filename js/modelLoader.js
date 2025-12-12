/**
 * Model Loader - Handles loading of various 3D file formats
 */

class ModelLoader {
    constructor() {
        this.gltfLoader = new THREE.GLTFLoader();
        this.objLoader = new THREE.OBJLoader();
        this.stlLoader = new THREE.STLLoader();
        this.mtlLoader = new THREE.MTLLoader();
    }

    /**
     * Load a 3D model file
     */
    async loadModel(file) {
        return new Promise((resolve, reject) => {
            const fileName = file.name.toLowerCase();
            const reader = new FileReader();

            reader.onload = (event) => {
                const contents = event.target.result;

                try {
                    if (fileName.endsWith('.gltf')) {
                        this.loadGLTF(contents, resolve, reject, true);
                    } else if (fileName.endsWith('.glb')) {
                        this.loadGLB(contents, resolve, reject);
                    } else if (fileName.endsWith('.obj')) {
                        this.loadOBJ(contents, resolve, reject);
                    } else if (fileName.endsWith('.stl')) {
                        this.loadSTL(contents, resolve, reject);
                    } else if (fileName.endsWith('.step') || fileName.endsWith('.stp')) {
                        // STEP format requires specialized parser (opencascade.js)
                        // For now, show a message that it's not yet fully implemented
                        reject(new Error('STEP format support is in development. Please use glTF, OBJ, or STL formats.'));
                    } else {
                        reject(new Error('Unsupported file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));

            // Read file based on format
            if (fileName.endsWith('.glb') || fileName.endsWith('.stl')) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    loadGLTF(contents, resolve, reject, isText = true) {
        const loader = new THREE.GLTFLoader();
        
        if (isText) {
            // Parse JSON text
            const data = JSON.parse(contents);
            loader.parse(contents, '', (gltf) => {
                resolve(this.processGLTFScene(gltf.scene));
            }, reject);
        }
    }

    loadGLB(arrayBuffer, resolve, reject) {
        const loader = new THREE.GLTFLoader();
        loader.parse(arrayBuffer, '', (gltf) => {
            resolve(this.processGLTFScene(gltf.scene));
        }, reject);
    }

    loadOBJ(contents, resolve, reject) {
        try {
            const loader = new THREE.OBJLoader();
            const object = loader.parse(contents);
            resolve(this.processOBJScene(object));
        } catch (error) {
            reject(error);
        }
    }

    loadSTL(arrayBuffer, resolve, reject) {
        try {
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(arrayBuffer);
            
            // Create mesh with material
            const material = new THREE.MeshPhongMaterial({
                color: 0x6699ff,
                specular: 0x111111,
                shininess: 200
            });
            const mesh = new THREE.Mesh(geometry, material);
            
            resolve({
                object: mesh,
                geometry: geometry
            });
        } catch (error) {
            reject(error);
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
            geometry: mainGeometry
        };
    }

    processOBJScene(object) {
        let mainGeometry = null;
        let mainObject = object;

        // Find the first mesh with geometry
        object.traverse((child) => {
            if (child.isMesh && child.geometry && !mainGeometry) {
                mainGeometry = child.geometry;
                mainObject = child;
                
                // Apply default material if none exists
                if (!child.material) {
                    child.material = new THREE.MeshPhongMaterial({
                        color: 0x6699ff,
                        specular: 0x111111,
                        shininess: 200
                    });
                }
            }
        });

        return {
            object: object,
            geometry: mainGeometry
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
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.render(scene, camera);

        const dataURL = renderer.domElement.toDataURL();
        
        // Cleanup
        renderer.dispose();
        
        return dataURL;
    }
}
