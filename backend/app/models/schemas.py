from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime


class Model3DBase(BaseModel):
    """Base model for 3D models"""

    name: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None


class Model3DCreate(Model3DBase):
    """Model for creating a 3D model"""

    pass


class Model3DResponse(Model3DBase):
    """Model for 3D model response"""

    id: int
    original_filename: str
    file_format: str
    file_size: int
    vertex_count: Optional[int] = None
    face_count: Optional[int] = None
    volume: Optional[float] = None
    surface_area: Optional[float] = None
    compactness: Optional[float] = None
    bounding_box: Optional[Dict] = None
    thumbnail_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SearchResult(BaseModel):
    """Search result model"""

    model: Model3DResponse
    similarity_score: float = Field(..., ge=0, le=1)
    distance: float


class SearchResponse(BaseModel):
    """Search response model"""

    query_id: int
    results: List[SearchResult]
    processing_time: float
    total_results: int


class UploadResponse(BaseModel):
    """File upload response"""

    message: str
    file_id: str
    filename: str
    size: int


class FeatureVector(BaseModel):
    """Feature vector model"""

    d2_descriptor: List[float] = Field(..., min_length=64, max_length=64)
    volume: float
    surface_area: float
    compactness: float
    bbox_ratios: List[float] = Field(..., min_length=3, max_length=3)
    convexity: float

    @field_validator("d2_descriptor", "bbox_ratios")
    @classmethod
    def validate_list_not_empty(cls, v):
        if not v:
            raise ValueError("List cannot be empty")
        return v


class StatsResponse(BaseModel):
    """System statistics response"""

    total_models: int
    total_searches: int
    indexed_models: int
    storage_used: int  # in bytes
    avg_processing_time: float
