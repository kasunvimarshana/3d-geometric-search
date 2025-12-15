# API Documentation

Complete REST API documentation for the 3D Geometric Search Engine.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required. For production deployment, consider implementing API keys or OAuth.

---

## Endpoints

### 1. Health Check

Check if the server is running and responsive.

**Endpoint:** `GET /api/health`

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-13T10:30:00.000Z"
}
```

**Status Codes:**

- `200 OK` - Server is healthy

---

### 2. Upload Model

Upload a 3D model file for processing and feature extraction.

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Parameters:**

| Name | Type | Required | Description                                          |
| ---- | ---- | -------- | ---------------------------------------------------- |
| file | File | Yes      | 3D model file (.gltf, .glb, .step, .stp, .obj, .stl) |

**Example Request:**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

**Response:**

```json
{
  "success": true,
  "modelId": "123e4567-e89b-12d3-a456-426614174000",
  "filename": "airplane.gltf",
  "features": {
    "vertexCount": 1523,
    "faceCount": 2841,
    "surfaceArea": 125.43,
    "volume": 45.67,
    "boundingBox": {
      "min": { "x": -5, "y": -2, "z": -3 },
      "max": { "x": 5, "y": 2, "z": 3 },
      "center": { "x": 0, "y": 0, "z": 0 },
      "dimensions": { "width": 10, "height": 4, "depth": 6 }
    },
    "sphericity": 0.78,
    "compactness": 1.23,
    "aspectRatio1": 0.85,
    "aspectRatio2": 0.72,
    "meanCurvature": 0.12,
    "gaussianCurvature": 0.08
  },
  "previewUrl": "/uploads/123e4567.gltf"
}
```

**Status Codes:**

- `200 OK` - Upload successful
- `400 Bad Request` - Invalid file or missing file
- `500 Internal Server Error` - Processing failed

**Error Response:**

```json
{
  "error": "Unsupported file format: .txt"
}
```

---

### 3. Search Similar Models

Find models similar to a query model based on geometric features.

**Endpoint:** `POST /api/search`

**Content-Type:** `application/json`

**Parameters:**

| Name      | Type   | Required | Description                                  |
| --------- | ------ | -------- | -------------------------------------------- |
| modelId   | String | Yes      | ID of the query model                        |
| threshold | Number | No       | Similarity threshold (0.0-1.0), default: 0.7 |
| limit     | Number | No       | Maximum results to return, default: 10       |

**Example Request:**

```javascript
fetch("/api/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    modelId: "123e4567-e89b-12d3-a456-426614174000",
    threshold: 0.8,
    limit: 5,
  }),
});
```

**Response:**

```json
{
  "success": true,
  "queryModel": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "airplane.gltf",
    "features": { ... }
  },
  "results": [
    {
      "modelId": "234e5678-e89b-12d3-a456-426614174001",
      "filename": "aircraft.obj",
      "format": "obj",
      "similarity": 0.92,
      "features": { ... },
      "featureComparison": {
        "volume": {
          "query": 45.67,
          "match": 47.23,
          "similarity": 0.96
        },
        "surfaceArea": {
          "query": 125.43,
          "match": 128.91,
          "similarity": 0.97
        },
        "sphericity": {
          "query": 0.78,
          "match": 0.81,
          "similarity": 0.96
        }
      }
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Search successful
- `400 Bad Request` - Missing modelId
- `404 Not Found` - Model not found
- `500 Internal Server Error` - Search failed

---

### 4. Get All Models

Retrieve a list of all uploaded models.

**Endpoint:** `GET /api/models`

**Response:**

```json
{
  "success": true,
  "models": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "filename": "airplane.gltf",
      "format": "gltf",
      "uploadDate": "2025-12-13T10:30:00.000Z",
      "previewUrl": "/uploads/123e4567.gltf",
      "features": { ... }
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Success
- `500 Internal Server Error` - Database error

---

### 5. Get Specific Model

Retrieve details of a specific model by ID.

**Endpoint:** `GET /api/models/:id`

**Parameters:**

| Name | Type   | Location | Description |
| ---- | ------ | -------- | ----------- |
| id   | String | Path     | Model ID    |

**Example Request:**

```javascript
fetch("/api/models/123e4567-e89b-12d3-a456-426614174000");
```

**Response:**

```json
{
  "success": true,
  "model": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "filename": "airplane.gltf",
    "format": "gltf",
    "filepath": "123e4567.gltf",
    "uploadDate": "2025-12-13T10:30:00.000Z",
    "previewUrl": "/uploads/123e4567.gltf",
    "features": { ... }
  }
}
```

**Status Codes:**

- `200 OK` - Success
- `404 Not Found` - Model not found
- `500 Internal Server Error` - Database error

---

### 6. Delete Model

Delete a model and its associated files.

**Endpoint:** `DELETE /api/models/:id`

**Parameters:**

| Name | Type   | Location | Description |
| ---- | ------ | -------- | ----------- |
| id   | String | Path     | Model ID    |

**Example Request:**

```javascript
fetch("/api/models/123e4567-e89b-12d3-a456-426614174000", {
  method: "DELETE",
});
```

**Response:**

```json
{
  "success": true,
  "message": "Model deleted"
}
```

**Status Codes:**

- `200 OK` - Deleted successfully
- `404 Not Found` - Model not found
- `500 Internal Server Error` - Deletion failed

---

### 7. Get Template Shapes

Get available template geometric shapes.

**Endpoint:** `GET /api/templates`

**Response:**

```json
{
  "success": true,
  "templates": [
    { "id": "cube", "name": "Cube", "type": "primitive" },
    { "id": "sphere", "name": "Sphere", "type": "primitive" },
    { "id": "cylinder", "name": "Cylinder", "type": "primitive" },
    { "id": "cone", "name": "Cone", "type": "primitive" },
    { "id": "torus", "name": "Torus", "type": "primitive" },
    { "id": "tetrahedron", "name": "Tetrahedron", "type": "primitive" }
  ]
}
```

**Status Codes:**

- `200 OK` - Success

---

## Feature Object Schema

The `features` object returned by the API contains:

```json
{
  "vertexCount": 1523,
  "faceCount": 2841,
  "surfaceArea": 125.43,
  "volume": 45.67,
  "width": 10.0,
  "height": 4.0,
  "depth": 6.0,
  "diagonal": 12.16,
  "sphericity": 0.78,
  "compactness": 1.23,
  "aspectRatio1": 0.85,
  "aspectRatio2": 0.72,
  "elongation": 5.2,
  "meanCurvature": 0.12,
  "gaussianCurvature": 0.08,
  "curvatureVariance": 0.03,
  "eulerCharacteristic": 2,
  "genus": 0,
  "isManifold": true,
  "boundingBox": {
    "min": { "x": -5, "y": -2, "z": -3 },
    "max": { "x": 5, "y": 2, "z": 3 },
    "center": { "x": 0, "y": 0, "z": 0 },
    "dimensions": { "width": 10, "height": 4, "depth": 6 }
  },
  "principalComponents": [15.3, 8.2, 3.1],
  "shapeDistribution": {
    "mean": 3.45,
    "stdDev": 1.23,
    "histogram": [0.05, 0.08, 0.12, 0.15, 0.18, 0.16, 0.12, 0.08, 0.04, 0.02]
  },
  "normalizedVector": [ ... ],
  "format": "gltf"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error scenarios:

1. **Invalid file format**

   - Status: 400
   - Error: "Unsupported file format: .xyz"

2. **File too large**

   - Status: 400
   - Error: "File too large (max 50MB)"

3. **Model not found**

   - Status: 404
   - Error: "Model not found"

4. **Processing failed**
   - Status: 500
   - Error: "Failed to parse 3D model"

---

## Rate Limiting

Currently, no rate limiting is implemented. For production:

- Implement rate limiting (e.g., 100 requests/minute per IP)
- Use API keys for identification
- Monitor usage patterns

---

## CORS

CORS is enabled by default for all origins. To restrict:

```javascript
app.use(
  cors({
    origin: "https://yourdomain.com",
  })
);
```

---

## Examples

### Complete Upload & Search Workflow

```javascript
// 1. Upload a model
async function uploadAndSearch(file) {
  // Upload
  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const uploadData = await uploadResponse.json();
  const modelId = uploadData.modelId;

  // Search for similar
  const searchResponse = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      modelId,
      threshold: 0.75,
      limit: 10,
    }),
  });

  const searchData = await searchResponse.json();
  console.log("Similar models:", searchData.results);
}
```

---

## WebSocket Support

Currently not implemented. For real-time updates, consider adding Socket.io for:

- Upload progress
- Search progress
- Live collaboration

---

For more information, see the main [README.md](README.md).
