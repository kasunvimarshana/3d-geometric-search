from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import time
import shutil
import logging

from app.core.database import get_db
from app.core.config import settings
from app.models.schemas import Model3DResponse, Model3DCreate
from app.models.database import Model3D
from app.services.geometry import MeshProcessor, FeatureExtractor
from app.services.search.index_manager import IndexManager

router = APIRouter()
logger = logging.getLogger(__name__)


def get_index_manager() -> IndexManager:
    """Get the index manager from app state"""
    from app.main import index_manager

    return index_manager


@router.get("/", response_model=List[Model3DResponse])
async def list_models(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List all indexed 3D models

    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        category: Filter by category
        db: Database session

    Returns:
        List of models
    """
    query = db.query(Model3D)

    if category:
        query = query.filter(Model3D.category == category)

    models = query.offset(skip).limit(limit).all()
    return models


@router.get("/{model_id}", response_model=Model3DResponse)
async def get_model(model_id: int, db: Session = Depends(get_db)):
    """
    Get a specific model by ID

    Args:
        model_id: Model ID
        db: Database session

    Returns:
        Model details
    """
    model = db.query(Model3D).filter(Model3D.id == model_id).first()

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    return model


@router.post("/index", response_model=Model3DResponse)
async def index_model(
    file: UploadFile = File(...),
    name: str = Query(...),
    category: Optional[str] = None,
    description: Optional[str] = None,
    db: Session = Depends(get_db),
    index_mgr: IndexManager = Depends(get_index_manager),
):
    """
    Upload and index a new 3D model

    Args:
        file: 3D model file
        name: Model name
        category: Model category
        description: Model description
        db: Database session
        index_mgr: Index manager

    Returns:
        Created model
    """
    # Validate file
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, detail=f"File type {file_ext} not supported"
        )

    # Generate unique filename
    timestamp = int(time.time())
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(file_path)

        # Process mesh
        processor = MeshProcessor(normalize=settings.NORMALIZE_MODELS)
        mesh_trimesh, mesh_o3d = processor.load_mesh(file_path)

        if mesh_trimesh is None:
            raise HTTPException(status_code=400, detail="Failed to load mesh file")

        # Extract properties
        properties = processor.get_basic_properties(mesh_trimesh)

        # Extract features
        extractor = FeatureExtractor()
        feature_vector = extractor.extract_features(mesh_trimesh, mesh_o3d)

        # Create database entry
        model = Model3D(
            name=name,
            original_filename=file.filename,
            file_path=file_path,
            file_format=file_ext,
            file_size=file_size,
            vertex_count=properties["vertex_count"],
            face_count=properties["face_count"],
            volume=properties["volume"],
            surface_area=properties["surface_area"],
            compactness=properties["compactness"],
            bounding_box=properties["bounding_box"],
            feature_vector=feature_vector.tolist(),
            category=category,
            description=description,
        )

        db.add(model)
        db.commit()
        db.refresh(model)

        # Add to search index
        await index_mgr.add_model(model.id, feature_vector.tolist())

        logger.info(f"Indexed model {model.id}: {name}")

        return model

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error indexing model: {str(e)}")
        # Clean up file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error indexing model: {str(e)}")


@router.delete("/{model_id}")
async def delete_model(model_id: int, db: Session = Depends(get_db)):
    """
    Delete a model

    Args:
        model_id: Model ID
        db: Database session

    Returns:
        Success message
    """
    model = db.query(Model3D).filter(Model3D.id == model_id).first()

    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Delete file
    if os.path.exists(model.file_path):
        os.remove(model.file_path)

    # Delete from database
    db.delete(model)
    db.commit()

    # Note: Index rebuild needed to remove from search index
    logger.info(f"Deleted model {model_id}")

    return {"message": "Model deleted successfully"}
