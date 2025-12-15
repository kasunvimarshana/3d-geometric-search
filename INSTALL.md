# Installation Guide

This guide will walk you through setting up the 3D Geometric Search Engine on your local machine or server.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)

  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- **npm** (comes with Node.js)

  - Verify installation: `npm --version`

- **Git** (optional, for cloning)
  - Download from: https://git-scm.com/

## Step-by-Step Installation

### 1. Download or Clone the Project

**Option A: Clone from Git**

```bash
git clone <repository-url>
cd 3d-geometric-search
```

**Option B: Download ZIP**

- Download the project as ZIP
- Extract to your desired location
- Open terminal in the project directory

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:

- Express (web server)
- Three.js (3D rendering)
- better-sqlite3 (database)
- multer (file uploads)
- And other dependencies

**Expected output:**

```
added 150 packages in 20s
```

### 3. Verify Installation

Check that all dependencies are installed:

```bash
npm list --depth=0
```

### 4. Create Required Directories

The application will create these automatically, but you can create them manually:

```bash
mkdir uploads database
```

### 5. Start the Server

**Production mode:**

```bash
npm start
```

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Expected output:**

```
🚀 3D Geometric Search Server running on http://localhost:3000
📁 Upload directory: C:\path\to\uploads
💾 Database: C:\path\to\database\models.db

✨ Ready to accept 3D model uploads!
```

### 6. Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

You should see the 3D Geometric Search Engine interface.

## Configuration

### Port Configuration

To change the default port (3000), set the `PORT` environment variable:

**Windows (PowerShell):**

```powershell
$env:PORT=8080; npm start
```

**Linux/Mac:**

```bash
PORT=8080 npm start
```

### Environment Variables

Create a `.env` file in the project root for custom configuration:

```env
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50000000
DATABASE_PATH=./database/models.db
ENABLE_CORS=true
```

## Troubleshooting

### Issue: "Cannot find module"

**Solution:** Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port already in use"

**Solution:** Use a different port or kill the process using port 3000

**Windows:**

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
lsof -i :3000
kill -9 <PID>
```

### Issue: "EACCES: permission denied"

**Solution:** Run with appropriate permissions or change upload directory

**Linux/Mac:**

```bash
sudo chown -R $USER:$USER .
```

### Issue: SQLite installation fails on Windows

**Solution:** Install Visual Studio Build Tools

```bash
npm install --global windows-build-tools
npm install better-sqlite3
```

### Issue: Three.js not loading

**Solution:** Check internet connection (Three.js loads from CDN) or use local copy

## Verifying Installation

### Health Check

Test the API endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{ "status": "ok", "timestamp": "2025-12-13T..." }
```

### Upload Test

Try uploading a simple STL or OBJ file through the web interface.

## Next Steps

1. **Upload Models**: Drag and drop 3D files to test the system
2. **Try Templates**: Click on template shapes to see 3D visualization
3. **Search**: Upload multiple models and test the similarity search
4. **Read Documentation**: Check README.md for detailed usage

## Updating

To update to the latest version:

```bash
git pull origin main
npm install
npm start
```

## Uninstallation

To completely remove the application:

```bash
# Remove installed packages
rm -rf node_modules

# Remove uploaded files and database
rm -rf uploads database

# Remove the project directory
cd ..
rm -rf 3d-geometric-search
```

## Support

If you encounter issues:

1. Check the console output for error messages
2. Review the logs in the terminal
3. Consult the README.md
4. Open an issue on GitHub

## System Requirements

**Minimum:**

- CPU: 2 cores
- RAM: 2 GB
- Disk: 500 MB free space
- Browser: Chrome 90+, Firefox 88+, Edge 90+

**Recommended:**

- CPU: 4 cores
- RAM: 4 GB
- Disk: 5 GB free space
- GPU: WebGL 2.0 compatible

---

**Installation complete! You're ready to start searching 3D models geometrically.**
