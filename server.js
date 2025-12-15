const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Import custom modules
const db = require("./src/database/db");
const { parseModel } = require("./src/parsers/index");
const { extractFeatures } = require("./src/geometric/feature-extractor");
const { findSimilar } = require("./src/geometric/similarity");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure required directories exist
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DB_DIR = path.join(__dirname, "database");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database
db.initialize();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        workerSrc: ["'self'", "blob:"],
      },
    },
  })
);
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));
app.use("/uploads", express.static(UPLOAD_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    ".gltf",
    ".glb",
    ".step",
    ".stp",
    ".obj",
    ".mtl",
    ".stl",
  ];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file format: ${ext}. Supported formats: ${allowedExtensions.join(
          ", "
        )}`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Upload and process 3D model
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileExt = path.extname(fileName).toLowerCase();

    console.log(`Processing uploaded file: ${fileName}`);

    // Parse the 3D model
    const geometryData = await parseModel(filePath, fileExt);

    if (!geometryData) {
      fs.unlinkSync(filePath); // Clean up
      return res.status(400).json({ error: "Failed to parse 3D model" });
    }

    // Extract geometric features
    const features = extractFeatures(geometryData);

    // Store in database
    const modelId = uuidv4();
    const format = fileExt.replace(".", "");
    const uploadDate = new Date().toISOString();

    db.insertModel({
      id: modelId,
      filename: fileName,
      filepath: req.file.filename,
      format: format,
      features: JSON.stringify(features),
      uploadDate: uploadDate,
    });

    res.json({
      success: true,
      id: modelId,
      modelId: modelId,
      filename: fileName,
      format: format,
      uploadDate: uploadDate,
      features,
      previewUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: error.message });
  }
});

// Search for similar models
app.post("/api/search", async (req, res) => {
  try {
    const { modelId, threshold = 0.7, limit = 10 } = req.body;

    if (!modelId) {
      return res.status(400).json({ error: "modelId is required" });
    }

    // Get the query model
    const queryModel = db.getModel(modelId);

    if (!queryModel) {
      return res.status(404).json({ error: "Model not found" });
    }

    // Get all models except the query model
    const allModels = db.getAllModels().filter((m) => m.id !== modelId);

    // Parse features
    const queryFeatures = JSON.parse(queryModel.features);

    // Find similar models
    const results = findSimilar(queryFeatures, allModels, { threshold, limit });

    res.json({
      success: true,
      queryModel: {
        id: queryModel.id,
        filename: queryModel.filename,
        features: queryFeatures,
      },
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all models
app.get("/api/models", (req, res) => {
  try {
    const models = db.getAllModels().map((model) => ({
      id: model.id,
      filename: model.filename,
      format: model.format,
      uploadDate: model.uploadDate,
      previewUrl: `/uploads/${model.filepath}`,
      features: JSON.parse(model.features),
    }));

    res.json({ success: true, models });
  } catch (error) {
    console.error("Get models error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific model
app.get("/api/models/:id", (req, res) => {
  try {
    const model = db.getModel(req.params.id);

    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    res.json({
      success: true,
      model: {
        id: model.id,
        filename: model.filename,
        format: model.format,
        filepath: model.filepath,
        uploadDate: model.uploadDate,
        previewUrl: `/uploads/${model.filepath}`,
        features: JSON.parse(model.features),
      },
    });
  } catch (error) {
    console.error("Get model error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete model
app.delete("/api/models/:id", (req, res) => {
  try {
    const model = db.getModel(req.params.id);

    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    // Delete file
    const filePath = path.join(UPLOAD_DIR, model.filepath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.deleteModel(req.params.id);

    res.json({ success: true, message: "Model deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get template shapes
app.get("/api/templates", (req, res) => {
  const templates = [
    { id: "cube", name: "Cube", type: "primitive" },
    { id: "sphere", name: "Sphere", type: "primitive" },
    { id: "cylinder", name: "Cylinder", type: "primitive" },
    { id: "cone", name: "Cone", type: "primitive" },
    { id: "torus", name: "Torus", type: "primitive" },
    { id: "tetrahedron", name: "Tetrahedron", type: "primitive" },
  ];

  res.json({ success: true, templates });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large (max 50MB)" });
    }
  }

  res.status(500).json({ error: err.message || "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `\n🚀 3D Geometric Search Server running on http://localhost:${PORT}`
  );
  console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
  console.log(`💾 Database: ${path.join(DB_DIR, "models.db")}`);
  console.log("\n✨ Ready to accept 3D model uploads!\n");
});

module.exports = app;
