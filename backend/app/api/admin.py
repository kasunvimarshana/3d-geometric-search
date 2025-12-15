from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import logging

from app.core.database import get_db
from app.models.schemas import StatsResponse
from app.models.database import Model3D, SearchQuery
from app.services.search.index_manager import IndexManager

router = APIRouter()
logger = logging.getLogger(__name__)


def get_index_manager() -> IndexManager:
    """Get the index manager from app state"""
    from app.main import index_manager

    return index_manager


@router.post("/reindex")
async def reindex_all(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    index_mgr: IndexManager = Depends(get_index_manager),
):
    """
    Rebuild the search index from all models in database

    This operation runs in the background
    """
    background_tasks.add_task(index_mgr.rebuild_index, db)

    return {"message": "Reindexing started in background"}


@router.get("/stats", response_model=StatsResponse)
async def get_statistics(
    db: Session = Depends(get_db), index_mgr: IndexManager = Depends(get_index_manager)
):
    """
    Get system statistics

    Returns:
        Statistics about models and searches
    """
    # Count models
    total_models = db.query(func.count(Model3D.id)).scalar()

    # Count searches
    total_searches = db.query(func.count(SearchQuery.id)).scalar()

    # Average processing time
    avg_time = db.query(func.avg(SearchQuery.processing_time)).scalar() or 0.0

    # Storage used
    storage_used = db.query(func.sum(Model3D.file_size)).scalar() or 0

    # Indexed models
    index_stats = index_mgr.get_stats()
    indexed_models = index_stats.get("total_vectors", 0)

    return StatsResponse(
        total_models=total_models,
        total_searches=total_searches,
        indexed_models=indexed_models,
        storage_used=storage_used,
        avg_processing_time=avg_time,
    )


@router.post("/index-directory")
async def index_directory(
    path: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    """
    Index all models in a directory (placeholder)

    Args:
        path: Directory path to scan for models

    Returns:
        Status message
    """
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Directory not found")

    # This would be implemented to scan directory and index all models
    # For now, just return a message
    return {"message": "Directory indexing not yet implemented", "path": path}
