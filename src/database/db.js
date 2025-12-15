const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "..", "..", "database", "models.db");
let db = null;

/**
 * Initialize the database and create tables
 */
function initialize() {
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrency
    db.pragma("journal_mode = WAL");

    // Create models table
    db.exec(`
      CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        format TEXT NOT NULL,
        features TEXT NOT NULL,
        uploadDate TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for faster queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_format ON models(format);
      CREATE INDEX IF NOT EXISTS idx_uploadDate ON models(uploadDate);
    `);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  }
}

/**
 * Insert a new model into the database
 */
function insertModel(model) {
  const stmt = db.prepare(`
    INSERT INTO models (id, filename, filepath, format, features, uploadDate)
    VALUES (@id, @filename, @filepath, @format, @features, @uploadDate)
  `);

  return stmt.run(model);
}

/**
 * Get a model by ID
 */
function getModel(id) {
  const stmt = db.prepare("SELECT * FROM models WHERE id = ?");
  return stmt.get(id);
}

/**
 * Get all models
 */
function getAllModels() {
  const stmt = db.prepare("SELECT * FROM models ORDER BY uploadDate DESC");
  return stmt.all();
}

/**
 * Update model features
 */
function updateModelFeatures(id, features) {
  const stmt = db.prepare("UPDATE models SET features = ? WHERE id = ?");
  return stmt.run(JSON.stringify(features), id);
}

/**
 * Delete a model
 */
function deleteModel(id) {
  const stmt = db.prepare("DELETE FROM models WHERE id = ?");
  return stmt.run(id);
}

/**
 * Get models by format
 */
function getModelsByFormat(format) {
  const stmt = db.prepare(
    "SELECT * FROM models WHERE format = ? ORDER BY uploadDate DESC"
  );
  return stmt.all(format);
}

/**
 * Search models with feature filtering
 */
function searchModels(criteria) {
  // This is a simple implementation - can be enhanced with more complex queries
  const models = getAllModels();

  return models.filter((model) => {
    const features = JSON.parse(model.features);

    // Apply filters based on criteria
    if (criteria.minVolume && features.volume < criteria.minVolume)
      return false;
    if (criteria.maxVolume && features.volume > criteria.maxVolume)
      return false;
    if (
      criteria.minSurfaceArea &&
      features.surfaceArea < criteria.minSurfaceArea
    )
      return false;
    if (
      criteria.maxSurfaceArea &&
      features.surfaceArea > criteria.maxSurfaceArea
    )
      return false;

    return true;
  });
}

/**
 * Get database statistics
 */
function getStats() {
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM models");
  const formatStmt = db.prepare(
    "SELECT format, COUNT(*) as count FROM models GROUP BY format"
  );

  return {
    totalModels: countStmt.get().count,
    byFormat: formatStmt.all(),
  };
}

/**
 * Close database connection
 */
function close() {
  if (db) {
    db.close();
    console.log("Database connection closed");
  }
}

module.exports = {
  initialize,
  insertModel,
  getModel,
  getAllModels,
  updateModelFeatures,
  deleteModel,
  getModelsByFormat,
  searchModels,
  getStats,
  close,
};
