from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import time
import shutil
import logging

from app.core.database import get_db
from app.core.config import settings
from app.models.schemas import SearchResponse, SearchResult, Model3DResponse
from app.models.database import Model3D, SearchQuery
from app.services.geometry import MeshProcessor, FeatureExtractor
from app.services.search.index_manager import IndexManager

router = APIRouter()
logger = logging.getLogger(__name__)


def get_index_manager() -> IndexManager:
    """Get the index manager from app state"""
    from app.main import index_manager

    return index_manager


@router.post("/upload", response_model=SearchResponse)
async def search_by_upload(
    file: UploadFile = File(...),
    k: int = 20,
    db: Session = Depends(get_db),
    index_mgr: IndexManager = Depends(get_index_manager),
):
    """
    Upload a 3D model and search for similar models

    Args:
        file: 3D model file
        k: Number of results to return
        db: Database session
        index_mgr: Index manager

    Returns:
        Search results with similar models
    """
    start_time = time.time()

    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    # Validate file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to start

    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024} MB",
        )

    # Save uploaded file temporarily
    temp_path = os.path.join(
        settings.UPLOAD_DIR, f"temp_{int(time.time())}_{file.filename}"
    )
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process mesh
        processor = MeshProcessor(normalize=settings.NORMALIZE_MODELS)
        mesh_trimesh, mesh_o3d = processor.load_mesh(temp_path)

        if mesh_trimesh is None:
            raise HTTPException(status_code=400, detail="Failed to load mesh file")

        # Extract features
        extractor = FeatureExtractor()
        feature_vector = extractor.extract_features(mesh_trimesh, mesh_o3d)

        # Search for similar models
        search_results = await index_mgr.search_similar(feature_vector.tolist(), k)

        # Get model details from database
        results = []
        for result in search_results:
            model = db.query(Model3D).filter(Model3D.id == result["model_id"]).first()
            if model:
                results.append(
                    SearchResult(
                        model=Model3DResponse.from_orm(model),
                        similarity_score=result["similarity_score"],
                        distance=1.0 - result["similarity_score"],
                    )
                )

        processing_time = time.time() - start_time

        # Save search query to database
        search_query = SearchQuery(
            query_type="upload",
            file_path=temp_path,
            feature_vector=feature_vector.tolist(),
            results_count=len(results),
            processing_time=processing_time,
        )
        db.add(search_query)
        db.commit()
        db.refresh(search_query)

        return SearchResponse(
            query_id=search_query.id,
            results=results,
            processing_time=processing_time,
            total_results=len(results),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass


@router.post("/sketch", response_model=SearchResponse)
async def search_by_sketch(
    # Sketch data would be posted as JSON
    # This is a placeholder - actual implementation would depend on sketch format
    db: Session = Depends(get_db),
):
    """
    Search by sketch (placeholder for future implementation)

    This would process sketch data and convert it to a 3D shape for searching
    """
    raise HTTPException(
        status_code=501,
        detail="Sketch search not yet implemented. Use upload search instead.",
    )


@router.get("/{query_id}", response_model=SearchResponse)
async def get_search_results(query_id: int, db: Session = Depends(get_db)):
    """
    Get results from a previous search query

    Args:
        query_id: ID of the search query
        db: Database session

    Returns:
        Search results
    """
    search_query = db.query(SearchQuery).filter(SearchQuery.id == query_id).first()

    if not search_query:
        raise HTTPException(status_code=404, detail="Search query not found")

    # This is a simplified version - in production you'd cache the results
    raise HTTPException(
        status_code=501, detail="Retrieving cached search results not yet implemented"
    )
