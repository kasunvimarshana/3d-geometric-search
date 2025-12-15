import numpy as np
import faiss
from typing import List, Tuple, Optional
import logging
import pickle
import os

logger = logging.getLogger(__name__)


class SimilaritySearch:
    """
    Efficient similarity search using FAISS
    """

    def __init__(self, dimension: int = 83):
        """
        Initialize similarity search

        Args:
            dimension: Dimension of feature vectors
        """
        self.dimension = dimension
        self.index = None
        self.model_ids = []
        self._initialize_index()

    def _initialize_index(self):
        """Initialize FAISS index"""
        # Use L2 distance (euclidean)
        # For cosine similarity, we normalize vectors before adding
        self.index = faiss.IndexFlatL2(self.dimension)
        logger.info(f"Initialized FAISS index with dimension {self.dimension}")

    def add_vectors(self, vectors: np.ndarray, model_ids: List[int]):
        """
        Add feature vectors to the index

        Args:
            vectors: Feature vectors to add (n_vectors, dimension)
            model_ids: Corresponding model IDs
        """
        if vectors.shape[1] != self.dimension:
            raise ValueError(
                f"Vector dimension {vectors.shape[1]} does not match index dimension {self.dimension}"
            )

        # Normalize vectors for cosine similarity
        vectors = self._normalize_vectors(vectors)

        # Add to index
        self.index.add(vectors.astype("float32"))
        self.model_ids.extend(model_ids)

        logger.info(
            f"Added {len(model_ids)} vectors to index. Total: {self.index.ntotal}"
        )

    def search(
        self, query_vector: np.ndarray, k: int = 20
    ) -> Tuple[List[int], List[float]]:
        """
        Search for k nearest neighbors

        Args:
            query_vector: Query feature vector (dimension,)
            k: Number of results to return

        Returns:
            Tuple of (model_ids, distances)
        """
        if query_vector.shape[0] != self.dimension:
            raise ValueError(
                f"Query vector dimension {query_vector.shape[0]} does not match index dimension {self.dimension}"
            )

        # Normalize query vector
        query_vector = self._normalize_vectors(query_vector.reshape(1, -1))

        # Perform search
        k = min(k, self.index.ntotal)  # Don't request more than available
        distances, indices = self.index.search(query_vector.astype("float32"), k)

        # Convert to model IDs
        result_model_ids = [self.model_ids[idx] for idx in indices[0]]
        result_distances = distances[0].tolist()

        # Convert L2 distance to similarity score (0-1, higher is more similar)
        # For normalized vectors, L2 distance is related to cosine similarity
        # similarity = 1 - (distance^2 / 4)
        similarities = [max(0, 1 - (d**2 / 4)) for d in result_distances]

        return result_model_ids, similarities

    def remove_vector(self, model_id: int) -> bool:
        """
        Remove a vector from the index

        Note: FAISS IndexFlatL2 doesn't support removal, so we need to rebuild

        Args:
            model_id: Model ID to remove

        Returns:
            True if removed successfully
        """
        if model_id not in self.model_ids:
            return False

        # For now, we'll just mark it (rebuild will be needed for actual removal)
        logger.warning("Vector removal requires index rebuild")
        return False

    def rebuild_index(self, vectors: np.ndarray, model_ids: List[int]):
        """
        Rebuild the index from scratch

        Args:
            vectors: All feature vectors (n_vectors, dimension)
            model_ids: Corresponding model IDs
        """
        self._initialize_index()
        self.model_ids = []
        self.add_vectors(vectors, model_ids)
        logger.info("Index rebuilt successfully")

    def save(self, index_path: str, metadata_path: str):
        """
        Save index to disk

        Args:
            index_path: Path to save FAISS index
            metadata_path: Path to save metadata (model IDs)
        """
        faiss.write_index(self.index, index_path)

        with open(metadata_path, "wb") as f:
            pickle.dump({"model_ids": self.model_ids, "dimension": self.dimension}, f)

        logger.info(f"Index saved to {index_path}")

    def load(self, index_path: str, metadata_path: str):
        """
        Load index from disk

        Args:
            index_path: Path to FAISS index
            metadata_path: Path to metadata file
        """
        if not os.path.exists(index_path) or not os.path.exists(metadata_path):
            logger.warning("Index files not found, using empty index")
            return

        self.index = faiss.read_index(index_path)

        with open(metadata_path, "rb") as f:
            metadata = pickle.load(f)
            self.model_ids = metadata["model_ids"]
            self.dimension = metadata["dimension"]

        logger.info(f"Index loaded with {self.index.ntotal} vectors")

    def _normalize_vectors(self, vectors: np.ndarray) -> np.ndarray:
        """
        Normalize vectors to unit length

        Args:
            vectors: Input vectors

        Returns:
            Normalized vectors
        """
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1  # Avoid division by zero
        return vectors / norms

    def get_stats(self) -> dict:
        """
        Get index statistics

        Returns:
            Dictionary with statistics
        """
        return {
            "total_vectors": self.index.ntotal,
            "dimension": self.dimension,
            "index_type": "IndexFlatL2",
        }
