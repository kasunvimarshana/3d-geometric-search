# Quick Start Guide

This guide will help you get 3D GeoSearch up and running quickly.

## Prerequisites

- Docker and Docker Compose (recommended)
- OR: Python 3.9+, Node.js 18+, PostgreSQL 14+

## Option 1: Docker (Recommended)

This is the easiest way to get started.

```bash
# Clone the repository
git clone <your-repo-url>
cd 3d-geosearch

# Start all services
docker-compose up -d

# Wait for services to start (about 30 seconds)
# Check logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Option 2: Manual Setup

### 1. Setup PostgreSQL

```bash
# Create database
createdb geosearch

# Or use Docker for just the database
docker run -d \
  --name geosearch-db \
  -e POSTGRES_PASSWORD=geosearch_dev_password \
  -e POSTGRES_USER=geosearch \
  -e POSTGRES_DB=geosearch \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env with your database credentials

# Run the server
uvicorn app.main:app --reload

# Backend will be available at http://localhost:8000
```

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

## First Steps

### 1. Check API Health

Visit http://localhost:8000/health or:

```bash
curl http://localhost:8000/health
```

### 2. Explore API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

### 3. Upload Your First Model

1. Go to http://localhost:3000/upload
2. Drag and drop a 3D model file (STL, OBJ, STEP, etc.)
3. Fill in the model name and details
4. Click "Upload and Index Model"

### 4. Search for Similar Models

1. Go to http://localhost:3000
2. Upload a 3D model to search
3. View similar models ranked by similarity

## Sample Models

You can find sample 3D models at:

- [Thingiverse](https://www.thingiverse.com/)
- [GrabCAD](https://grabcad.com/)
- [Free3D](https://free3d.com/)

Or use the Ar196 A-3 model in your workspace's models folder!

## Troubleshooting

### Backend won't start

- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Check if port 8000 is available

### Frontend won't start

- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check if port 3000 is available
- Try clearing node_modules: `rm -rf node_modules && npm install`

### File upload fails

- Check file size (max 100MB by default)
- Verify file format is supported
- Check backend logs for errors

### Search returns no results

- Make sure you've uploaded and indexed at least one model
- Check if the search index is initialized (check `/health` endpoint)

## Next Steps

- Read the full [README.md](README.md)
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Explore the API documentation at http://localhost:8000/docs
- Try different 3D models and compare results

## Getting Help

- Check existing [Issues](https://github.com/yourusername/3d-geosearch/issues)
- Create a new issue with detailed information
- Join our community discussions

## Stopping the Application

### Docker

```bash
docker-compose down
```

### Manual Setup

- Press Ctrl+C in both terminal windows
- Deactivate Python venv: `deactivate`
