from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, LargeBinary
from sqlalchemy.sql import func
from app.core.database import Base


class Model3D(Base):
    """3D Model database model"""

    __tablename__ = "models_3d"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_format = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes

    # Geometric properties
    vertex_count = Column(Integer)
    face_count = Column(Integer)
    volume = Column(Float)
    surface_area = Column(Float)
    compactness = Column(Float)
    bounding_box = Column(JSON)  # {min: [x,y,z], max: [x,y,z]}

    # Feature vector for similarity search
    feature_vector = Column(JSON, nullable=False)  # Stored as list

    # Metadata
    category = Column(String(100), index=True)
    tags = Column(JSON)  # List of tags
    description = Column(String(1000))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Thumbnail
    thumbnail_path = Column(String(512))

    def __repr__(self):
        return f"<Model3D(id={self.id}, name='{self.name}')>"


class SearchQuery(Base):
    """Search query history"""

    __tablename__ = "search_queries"

    id = Column(Integer, primary_key=True, index=True)
    query_type = Column(String(50), nullable=False)  # 'upload' or 'sketch'
    file_path = Column(String(512))
    feature_vector = Column(JSON, nullable=False)
    results_count = Column(Integer)
    processing_time = Column(Float)  # in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SearchQuery(id={self.id}, type='{self.query_type}')>"
