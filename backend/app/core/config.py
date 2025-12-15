from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    PROJECT_NAME: str = "3D GeoSearch"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database
    DATABASE_URL: str = (
        "postgresql://geosearch:geosearch_dev_password@localhost:5432/geosearch"
    )

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # File Upload
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS: List[str] = [
        ".stl",
        ".step",
        ".stp",
        ".obj",
        ".ply",
        ".off",
        ".iges",
        ".igs",
    ]

    # Search Settings
    SEARCH_RESULTS_LIMIT: int = 20
    FEATURE_VECTOR_DIM: int = 256

    # Processing
    MESH_SAMPLE_POINTS: int = 10000
    NORMALIZE_MODELS: bool = True

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
