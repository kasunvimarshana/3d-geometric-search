/**
 * Main Application Controller
 */

class App {
    constructor() {
        this.viewer = null;
        this.modelLoader = null;
        this.geometryAnalyzer = null;
        this.modelLibrary = {};
        this.currentModelName = null;
        
        this.init();
    }

    init() {
        // Initialize components
        this.viewer = new Viewer3D('viewer');
        this.modelLoader = new ModelLoader();
        this.geometryAnalyzer = new GeometryAnalyzer();

        // Setup event listeners
        this.setupEventListeners();

        // Load sample models (optional)
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // Upload button
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                this.handleFiles(e.dataTransfer.files);
            }
        });

        // Click upload area
        uploadArea.addEventListener('click', (e) => {
            if (e.target === uploadArea || e.target.closest('.upload-area')) {
                fileInput.click();
            }
        });

        // Viewer controls
        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.viewer.resetView();
        });

        document.getElementById('wireframeBtn').addEventListener('click', () => {
            this.viewer.toggleWireframe();
        });
    }

    async handleFiles(files) {
        for (let file of files) {
            await this.loadFile(file);
        }
    }

    async loadFile(file) {
        this.showLoading(true);

        try {
            // Load model
            const result = await this.modelLoader.loadModel(file);
            
            if (!result || !result.object || !result.geometry) {
                throw new Error('Failed to load model geometry');
            }

            // Generate unique name
            const modelName = this.generateModelName(file.name);

            // Analyze geometry
            const features = this.geometryAnalyzer.analyzeGeometry(result.geometry, modelName);

            if (!features) {
                throw new Error('Failed to analyze model geometry');
            }

            // Create thumbnail
            const thumbnail = this.modelLoader.createThumbnail(result.object);

            // Add to library
            this.modelLibrary[modelName] = {
                object: result.object,
                geometry: result.geometry,
                features: features,
                thumbnail: thumbnail,
                fileName: file.name
            };

            // Display model
            this.displayModel(modelName);

            // Update library grid
            this.updateLibraryGrid();

            // Find similar models
            this.findSimilarModels(modelName);

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading model:', error);
            alert('Error loading model: ' + error.message);
            this.showLoading(false);
        }
    }

    generateModelName(fileName) {
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        let name = baseName;
        let counter = 1;

        while (this.modelLibrary[name]) {
            name = `${baseName}_${counter}`;
            counter++;
        }

        return name;
    }

    displayModel(modelName) {
        const model = this.modelLibrary[modelName];
        if (!model) return;

        this.currentModelName = modelName;

        // Load model in viewer
        this.viewer.loadModel(model.object.clone());

        // Update model info
        this.updateModelInfo(model.features);

        // Update active state in library
        this.updateLibrarySelection(modelName);
    }

    updateModelInfo(features) {
        document.getElementById('vertexCount').textContent = features.vertexCount.toLocaleString();
        document.getElementById('faceCount').textContent = Math.round(features.faceCount).toLocaleString();
        
        const bbox = features.boundingBox;
        document.getElementById('boundingBox').textContent = 
            `${bbox.x.toFixed(2)} × ${bbox.y.toFixed(2)} × ${bbox.z.toFixed(2)}`;
    }

    updateLibraryGrid() {
        const grid = document.getElementById('libraryGrid');
        grid.innerHTML = '';

        for (const [name, model] of Object.entries(this.modelLibrary)) {
            const card = this.createModelCard(name, model);
            grid.appendChild(card);
        }
    }

    createModelCard(name, model) {
        const card = document.createElement('div');
        card.className = 'model-card';
        if (name === this.currentModelName) {
            card.classList.add('active');
        }

        // Thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'model-thumbnail';
        thumbnail.style.backgroundImage = `url(${model.thumbnail})`;
        thumbnail.style.backgroundSize = 'cover';
        thumbnail.style.backgroundPosition = 'center';
        card.appendChild(thumbnail);

        // Title
        const title = document.createElement('h4');
        title.textContent = name;
        card.appendChild(title);

        // Info
        const info = document.createElement('div');
        info.style.fontSize = '0.8em';
        info.style.color = '#666';
        info.textContent = `${model.features.vertexCount.toLocaleString()} vertices`;
        card.appendChild(info);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteModel(name);
        };
        card.appendChild(deleteBtn);

        // Click handler
        card.onclick = () => this.displayModel(name);

        return card;
    }

    deleteModel(name) {
        if (confirm(`Delete model "${name}"?`)) {
            delete this.modelLibrary[name];
            
            // If deleted model was current, show another
            if (this.currentModelName === name) {
                const remainingModels = Object.keys(this.modelLibrary);
                if (remainingModels.length > 0) {
                    this.displayModel(remainingModels[0]);
                } else {
                    this.currentModelName = null;
                    // Clear viewer and info
                    this.viewer.loadModel(new THREE.Object3D());
                    document.getElementById('vertexCount').textContent = '-';
                    document.getElementById('faceCount').textContent = '-';
                    document.getElementById('boundingBox').textContent = '-';
                }
            }

            this.updateLibraryGrid();
            
            // Update search results
            if (this.currentModelName) {
                this.findSimilarModels(this.currentModelName);
            } else {
                document.getElementById('resultsSection').style.display = 'none';
            }
        }
    }

    updateLibrarySelection(selectedName) {
        const cards = document.querySelectorAll('.model-card');
        cards.forEach(card => {
            card.classList.remove('active');
        });

        // Find and activate the selected card
        const allCards = Array.from(cards);
        const selectedCard = allCards.find(card => 
            card.querySelector('h4').textContent === selectedName
        );
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
    }

    findSimilarModels(targetModelName) {
        const targetModel = this.modelLibrary[targetModelName];
        if (!targetModel) return;

        // Get all features from library
        const libraryFeatures = {};
        for (const [name, model] of Object.entries(this.modelLibrary)) {
            libraryFeatures[name] = model.features;
        }

        // Find similar models
        const similar = this.geometryAnalyzer.findSimilar(
            targetModel.features, 
            libraryFeatures, 
            5
        );

        // Display results
        this.displaySearchResults(similar);
    }

    displaySearchResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');

        if (results.length === 0) {
            resultsSection.style.display = 'none';
            return;
        }

        resultsSection.style.display = 'block';
        resultsGrid.innerHTML = '';

        for (const result of results) {
            const model = this.modelLibrary[result.name];
            if (!model) continue;

            const card = this.createModelCard(result.name, model);
            
            // Add similarity score
            const scoreTag = document.createElement('span');
            scoreTag.className = 'similarity-score';
            scoreTag.textContent = `${result.similarity}% similar`;
            card.appendChild(scoreTag);

            resultsGrid.appendChild(card);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showWelcomeMessage() {
        // Display welcome info in viewer
        console.log('3D Geometric Search Application initialized');
        console.log('Supported formats: glTF/GLB, OBJ/MTL, STL');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
