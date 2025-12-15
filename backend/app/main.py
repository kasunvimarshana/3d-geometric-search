from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from typing import List
import logging

from app.core.config import settings
from app.api import search, models, admin
from app.core.database import engine, Base
from app.services.search.index_manager import IndexManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global index manager
index_manager = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global index_manager

    # Startup
    logger.info("Starting 3D GeoSearch application...")

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

    # Initialize search index
    index_manager = IndexManager()
    await index_manager.initialize()
    app.state.index_manager = index_manager
    logger.info("Search index initialized")

    yield

    # Shutdown
    logger.info("Shutting down 3D GeoSearch application...")
    if index_manager:
        await index_manager.shutdown()


app = FastAPI(
    title="3D GeoSearch API",
    description="Open-source 3D geometric search engine API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "3D GeoSearch API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "index": "ready" if index_manager and index_manager.is_ready() else "not ready",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
