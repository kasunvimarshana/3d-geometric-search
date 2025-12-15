import os
import asyncio
import numpy as np
from typing import List, Optional
from sqlalchemy.orm import Session
import logging

from app.services.search.similarity_search import SimilaritySearch
from app.models.database import Model3D
from app.core.config import settings

logger = logging.getLogger(__name__)


class IndexManager:
    """
    Manage the search index lifecycle
    """

    def __init__(self):
        self.search_engine: Optional[SimilaritySearch] = None
        self.index_path = os.path.join(settings.UPLOAD_DIR, "../indexed/faiss.index")
        self.metadata_path = os.path.join(
            settings.UPLOAD_DIR, "../indexed/metadata.pkl"
        )
        self._ready = False

    async def initialize(self):
        """Initialize the search index"""
        logger.info("Initializing index manager...")

        # Create directories if they don't exist
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)

        # Initialize search engine
        self.search_engine = SimilaritySearch(dimension=83)

        # Try to load existing index
        try:
            self.search_engine.load(self.index_path, self.metadata_path)
            logger.info("Loaded existing search index")
        except Exception as e:
            logger.warning(f"Could not load existing index: {str(e)}")
            logger.info("Starting with empty index")

        self._ready = True

    async def add_model(self, model_id: int, feature_vector: List[float]):
        """
        Add a model to the search index

        Args:
            model_id: Database ID of the model
            feature_vector: Feature vector for the model
        """
        if not self._ready:
            raise RuntimeError("Index manager not initialized")

        vector = np.array([feature_vector], dtype=np.float32)
        self.search_engine.add_vectors(vector, [model_id])

        # Save index periodically
        await self._save_index()

    async def search_similar(
        self, query_vector: List[float], k: int = 20
    ) -> List[dict]:
        """
        Search for similar models

        Args:
            query_vector: Query feature vector
            k: Number of results

        Returns:
            List of dicts with model_id and similarity_score
        """
        if not self._ready:
            raise RuntimeError("Index manager not initialized")

        vector = np.array(query_vector, dtype=np.float32)
        model_ids, similarities = self.search_engine.search(vector, k)

        results = [
            {"model_id": int(model_id), "similarity_score": float(score)}
            for model_id, score in zip(model_ids, similarities)
        ]

        return results

    async def rebuild_index(self, db: Session):
        """
        Rebuild the entire search index from database

        Args:
            db: Database session
        """
        logger.info("Rebuilding search index...")

        # Get all models from database
        models = db.query(Model3D).all()

        if not models:
            logger.warning("No models in database to index")
            return

        # Extract vectors and IDs
        vectors = []
        model_ids = []

        for model in models:
            if model.feature_vector:
                vectors.append(model.feature_vector)
                model_ids.append(model.id)

        if not vectors:
            logger.warning("No feature vectors found")
            return

        # Rebuild index
        vectors_array = np.array(vectors, dtype=np.float32)
        self.search_engine.rebuild_index(vectors_array, model_ids)

        # Save index
        await self._save_index()

        logger.info(f"Index rebuilt with {len(model_ids)} models")

    async def _save_index(self):
        """Save the index to disk"""
        try:
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None, self.search_engine.save, self.index_path, self.metadata_path
            )
        except Exception as e:
            logger.error(f"Error saving index: {str(e)}")

    def is_ready(self) -> bool:
        """Check if index is ready"""
        return self._ready

    async def shutdown(self):
        """Shutdown index manager"""
        if self._ready and self.search_engine:
            await self._save_index()
            logger.info("Index manager shut down")

    def get_stats(self) -> dict:
        """Get index statistics"""
        if not self._ready or not self.search_engine:
            return {"status": "not ready"}

        return self.search_engine.get_stats()
