/**
 * 3D Viewer - Manages the Three.js 3D viewport
 */

class Viewer3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.wireframeMode = false;
        
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        // Create camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(5, 5, 5);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 100;

        // Add lights
        this.addLights();

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        this.scene.add(gridHelper);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Hemisphere light for better illumination
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
        this.scene.add(hemisphereLight);
    }

    loadModel(object) {
        // Remove previous model
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }

        // Add new model
        this.currentModel = object;
        this.scene.add(this.currentModel);

        // Center and scale model
        this.centerAndScaleModel(this.currentModel);

        // Reset camera
        this.resetView();
    }

    centerAndScaleModel(object) {
        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center model
        object.position.sub(center);

        // Scale model to fit in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim; // Target size of 3 units
        object.scale.setScalar(scale);

        // Update controls target
        this.controls.target.set(0, 0, 0);
    }

    resetView() {
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    toggleWireframe() {
        this.wireframeMode = !this.wireframeMode;

        if (this.currentModel) {
            this.currentModel.traverse((child) => {
                if (child.isMesh) {
                    if (this.wireframeMode) {
                        // Store original material
                        child.userData.originalMaterial = child.material;
                        // Apply wireframe material
                        child.material = new THREE.MeshBasicMaterial({
                            color: 0x00ff00,
                            wireframe: true
                        });
                    } else {
                        // Restore original material
                        if (child.userData.originalMaterial) {
                            child.material = child.userData.originalMaterial;
                        }
                    }
                }
            });
        }
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }
    }
}
