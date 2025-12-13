# External Model Loading

This document describes how to load external 3D models from URLs or local files in the 3D Geometric Search application.

## Overview

The application now supports dynamic loading of 3D models from two sources:

1. **External URLs** - Load models hosted on the web
2. **Local Files** - Load models from your computer

## Supported Formats

- **GLTF** (`.gltf`) - GL Transmission Format (text-based)
- **GLB** (`.glb`) - Binary GL Transmission Format

## User Interface

### Loading from URL

1. Locate the **External Model** section in the controls panel
2. Enter the full URL of your GLTF/GLB file in the "Model URL" input field
3. Click the **Load URL** button

**Example URLs:**

```
https://example.com/models/building.gltf
https://example.com/models/car.glb
```

### Loading from Local File

1. Locate the **External Model** section in the controls panel
2. Click the **Choose File** button
3. Select a `.gltf` or `.glb` file from your computer
4. The selected filename will be displayed
5. Click the **Load File** button

## Features

### Automatic Model Processing

When a model is loaded, the application automatically:

- **Centers** the model at the origin
- **Normalizes scale** to fit the viewport
- **Creates sections** from the model hierarchy
- **Initializes lighting** for optimal visualization
- **Enables controls** for section management

### Model Information

- **Name extraction** - Automatically extracted from filename or URL
- **Type detection** - Automatically determines GLTF or GLB format
- **Unique ID** - Each external model gets a unique identifier

### Section Management

Once loaded, external models support all standard features:

- Section tree visualization
- Section highlighting
- Section isolation
- Navigation controls
- Zoom controls
- Fullscreen mode

## Technical Details

### Architecture

The external model loading feature follows the existing clean architecture:

```
┌─────────────────────────────────────┐
│  UI Layer (UIController)            │
│  - File input handling              │
│  - URL input validation             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Application Layer                  │
│  (ApplicationController)            │
│  - Orchestrates loading             │
│  - Error handling                   │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼──────┐  ┌──▼──────────────┐
│  Repository  │  │  Service Layer  │
│  Layer       │  │  - Model Loader │
│  - Create    │  │  - Section Mgr  │
│    External  │  │                 │
│    Model     │  │                 │
└──────────────┘  └─────────────────┘
```

### Model Repository Extensions

**New Methods:**

- `createExternalModel(source, name)` - Creates Model instance from URL or File
- `getNameFromSource(source)` - Extracts name from File or URL
- `getTypeFromSource(source)` - Determines GLTF or GLB type

### Model Loader Service Enhancements

**File Object Support:**

- Automatically creates object URLs for File objects
- Properly revokes object URLs after loading
- Maintains backward compatibility with URL strings

### Event Flow

```
1. User Action (URL input or file selection)
   ↓
2. Validation (format, existence)
   ↓
3. Model Creation (ModelRepository)
   ↓
4. Loading (ModelLoaderService)
   ↓
5. Scene Update (ViewerController)
   ↓
6. Section Creation (ModelRepository)
   ↓
7. UI Update (UIController)
   ↓
8. State Management (StateManager)
```

## Error Handling

### URL Validation

- Validates URL format before attempting to load
- Shows error message for invalid URLs
- Example error: "Invalid URL format"

### File Validation

- Checks file extension (must be `.gltf` or `.glb`)
- Shows error message for unsupported formats
- Example error: "Please select a GLTF or GLB file"

### Loading Errors

- Catches network errors for URL loading
- Catches file reading errors
- Displays user-friendly error messages
- Example: "Failed to load model: Network error"

### Loading States

- **Loading state** - Shows "Loading model..." in info overlay
- **Success state** - Clears loading, enables controls
- **Error state** - Shows error message, disables controls

## CORS Considerations

When loading models from external URLs, you may encounter CORS (Cross-Origin Resource Sharing) issues.

### Common CORS Errors

```
Access to fetch at 'https://example.com/model.gltf' from origin 'http://localhost:3001'
has been blocked by CORS policy
```

### Solutions

1. **Use CORS-enabled servers** - Ensure the server hosting models allows cross-origin requests
2. **Local development** - Use local files for development
3. **Proxy server** - Set up a proxy server to bypass CORS restrictions
4. **CORS browser extension** - Use browser extensions for development (not for production)

### Recommended Model Hosting

For production use, host models on:

- Your own server with CORS headers configured
- CDN services (AWS S3, Cloudflare, etc.)
- Static hosting with CORS support

## Best Practices

### Model Optimization

1. **File Size** - Keep models under 50MB for better performance
2. **Texture Resolution** - Use appropriate texture sizes (512px-2048px)
3. **Polygon Count** - Optimize mesh density for web viewing
4. **Compression** - Use GLB format for better compression

### URL Best Practices

1. **Use HTTPS** - Secure connections for external resources
2. **Direct Links** - Link directly to the model file, not a webpage
3. **CDN** - Use CDN for faster loading
4. **Caching** - Enable proper caching headers on your server

### File Best Practices

1. **Clean Hierarchy** - Organize model parts with meaningful names
2. **Embedded Textures** - Use GLB with embedded textures when possible
3. **Tested Models** - Validate models before loading
4. **Backup** - Keep backups of original models

## Examples

### Example 1: Loading from URL

```javascript
// User enters:
URL: https://cdn.example.com/models/building.glb

// System creates:
Model {
  id: "external-1702567890123",
  name: "building",
  url: "https://cdn.example.com/models/building.glb",
  type: "glb"
}
```

### Example 2: Loading from File

```javascript
// User selects:
File: "my-model.gltf"

// System creates:
Model {
  id: "external-1702567890456",
  name: "my-model",
  url: File { name: "my-model.gltf", ... },
  type: "gltf"
}
```

## Troubleshooting

### Model Doesn't Load

**Problem:** Model fails to load from URL

- Check URL is correct and accessible
- Verify CORS headers are set on server
- Check browser console for error messages
- Try loading the URL directly in browser

**Problem:** Model doesn't appear

- Check file format is GLTF or GLB
- Verify model is not empty
- Check browser console for errors
- Try a different model to isolate the issue

### Performance Issues

**Problem:** Model loads slowly

- Reduce file size
- Optimize textures
- Use GLB instead of GLTF
- Check network speed

**Problem:** Application freezes

- Model may be too complex
- Reduce polygon count
- Simplify model hierarchy
- Check browser memory usage

### Visual Issues

**Problem:** Model appears black

- Check model has proper materials
- Verify lighting in the scene
- Inspect model in external viewer first

**Problem:** Model is too large/small

- Application auto-scales, but may need adjustment
- Check model units in 3D software
- Manually scale in external software before importing

## API Reference

### ModelRepository

```javascript
/**
 * Create a model from external source
 * @param {string|File} source - URL string or File object
 * @param {string|null} name - Optional name (extracted if null)
 * @returns {Model} Model instance
 */
createExternalModel(source, (name = null));

/**
 * Extract name from source
 * @param {string|File} source - URL or File
 * @returns {string} Extracted name
 */
getNameFromSource(source);

/**
 * Determine model type from source
 * @param {string|File} source - URL or File
 * @returns {string} 'gltf', 'glb', or 'unknown'
 */
getTypeFromSource(source);
```

### ApplicationController

```javascript
/**
 * Handle loading model from URL
 * @async
 */
async handleLoadModelFromURL()

/**
 * Handle loading model from file
 * @async
 */
async handleLoadModelFromFile()

/**
 * Handle file selected event
 * @param {Event} event - File input change event
 */
handleFileSelected(event)

/**
 * Load external model (common logic)
 * @param {Model} model - Model to load
 * @async
 */
async loadExternalModel(model)
```

## Future Enhancements

Potential improvements for external model loading:

1. **Drag & Drop** - Drag model files directly onto viewer
2. **Recent Models** - Remember recently loaded URLs
3. **Model Library** - Save favorite external models
4. **Progress Indicator** - Show loading progress percentage
5. **Multiple Formats** - Support OBJ, FBX, STL formats
6. **Batch Loading** - Load multiple models at once
7. **Model Preview** - Show thumbnail before loading
8. **Cloud Integration** - Direct integration with cloud storage

## Security Considerations

### URL Loading

- Only load models from trusted sources
- Validate URL format before loading
- Be cautious with user-provided URLs
- Consider implementing URL whitelist for production

### File Loading

- Validate file extensions
- Check file size limits
- Be aware of malicious model files
- Consider file scanning in production

### Production Deployment

For production use:

1. Implement server-side validation
2. Set up rate limiting
3. Use secure HTTPS connections
4. Implement authentication if needed
5. Monitor for abuse

## Support

For issues or questions:

1. Check browser console for errors
2. Verify model format and size
3. Test with sample models
4. Review this documentation
5. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## License

This feature is part of the 3D Geometric Search application and is licensed under the MIT License.
