import numpy as np
import trimesh
import open3d as o3d
from typing import List, Dict
from scipy.spatial.distance import cdist
from sklearn.preprocessing import normalize
import logging

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """Extract geometric features from 3D meshes for similarity search"""

    def __init__(self, d2_bins: int = 64):
        self.d2_bins = d2_bins

    def extract_features(
        self, mesh_trimesh: trimesh.Trimesh, mesh_o3d: o3d.geometry.TriangleMesh
    ) -> np.ndarray:
        """
        Extract comprehensive feature vector from mesh

        Args:
            mesh_trimesh: Trimesh mesh object
            mesh_o3d: Open3D mesh object

        Returns:
            Feature vector as numpy array
        """
        features = []

        # 1. D2 Shape Distribution (64 dimensions)
        d2_features = self._compute_d2_descriptor(mesh_trimesh)
        features.extend(d2_features)

        # 2. Basic geometric features (5 dimensions)
        basic_features = self._compute_basic_features(mesh_trimesh)
        features.extend(basic_features)

        # 3. Bounding box ratios (3 dimensions)
        bbox_features = self._compute_bbox_features(mesh_trimesh)
        features.extend(bbox_features)

        # 4. Convexity measure (1 dimension)
        convexity = self._compute_convexity(mesh_trimesh)
        features.append(convexity)

        # 5. Moments (10 dimensions)
        moments = self._compute_moments(mesh_trimesh)
        features.extend(moments)

        # Total: 64 + 5 + 3 + 1 + 10 = 83 dimensions
        feature_vector = np.array(features, dtype=np.float32)

        # Normalize to unit length
        feature_vector = normalize(feature_vector.reshape(1, -1))[0]

        return feature_vector

    def _compute_d2_descriptor(
        self, mesh: trimesh.Trimesh, n_samples: int = 10000
    ) -> List[float]:
        """
        Compute D2 shape distribution: histogram of distances between random point pairs

        This is a rotation-invariant shape descriptor

        Args:
            mesh: Input mesh
            n_samples: Number of point pairs to sample

        Returns:
            Histogram values normalized to sum to 1
        """
        # Sample points from the mesh surface
        points, _ = trimesh.sample.sample_surface(mesh, n_samples)

        # Randomly select pairs of points
        n_pairs = min(n_samples // 2, 5000)
        idx1 = np.random.randint(0, len(points), n_pairs)
        idx2 = np.random.randint(0, len(points), n_pairs)

        # Compute distances between pairs
        distances = np.linalg.norm(points[idx1] - points[idx2], axis=1)

        # Create histogram
        hist, _ = np.histogram(distances, bins=self.d2_bins, density=True)

        # Normalize
        hist = hist / (np.sum(hist) + 1e-10)

        return hist.tolist()

    def _compute_basic_features(self, mesh: trimesh.Trimesh) -> List[float]:
        """
        Compute basic geometric features

        Returns:
            [log_volume, log_surface_area, compactness, aspect_ratio, edge_density]
        """
        features = []

        # Volume (log scale to handle wide range)
        volume = mesh.volume if mesh.is_watertight else 0.0
        features.append(np.log10(volume + 1e-10))

        # Surface area (log scale)
        features.append(np.log10(mesh.area + 1e-10))

        # Compactness (sphericity)
        if mesh.is_watertight and volume > 0:
            compactness = (36 * np.pi * volume**2) ** (1 / 3) / mesh.area
        else:
            compactness = 0.0
        features.append(compactness)

        # Aspect ratio (max/min extent)
        extents = mesh.extents
        if np.min(extents) > 0:
            aspect_ratio = np.max(extents) / np.min(extents)
        else:
            aspect_ratio = 1.0
        features.append(np.log10(aspect_ratio + 1))

        # Edge density
        edge_density = len(mesh.edges) / (len(mesh.vertices) + 1)
        features.append(np.log10(edge_density + 1))

        return features

    def _compute_bbox_features(self, mesh: trimesh.Trimesh) -> List[float]:
        """
        Compute bounding box dimension ratios

        Returns:
            [ratio_x/y, ratio_y/z, ratio_x/z]
        """
        extents = mesh.extents + 1e-10  # Avoid division by zero

        ratios = [
            extents[0] / extents[1],
            extents[1] / extents[2],
            extents[0] / extents[2],
        ]

        return ratios

    def _compute_convexity(self, mesh: trimesh.Trimesh) -> float:
        """
        Compute convexity as the ratio of mesh volume to convex hull volume

        Returns:
            Convexity ratio (0 to 1, 1 = perfectly convex)
        """
        try:
            if not mesh.is_watertight:
                return 0.5  # Default for non-watertight meshes

            convex_hull = mesh.convex_hull

            if convex_hull.volume > 0:
                convexity = mesh.volume / convex_hull.volume
            else:
                convexity = 1.0

            return float(np.clip(convexity, 0, 1))

        except Exception as e:
            logger.warning(f"Error computing convexity: {str(e)}")
            return 0.5

    def _compute_moments(
        self, mesh: trimesh.Trimesh, n_samples: int = 5000
    ) -> List[float]:
        """
        Compute statistical moments of the point distribution

        Returns:
            List of moment values (mean, std, skewness for x,y,z, plus covariance eigenvalues)
        """
        # Sample points from surface
        points, _ = trimesh.sample.sample_surface(mesh, n_samples)

        # Center the points
        points = points - np.mean(points, axis=0)

        # Compute moments for each axis
        moments = []
        for axis in range(3):
            axis_points = points[:, axis]
            moments.append(np.mean(axis_points))
            moments.append(np.std(axis_points))

        # Compute eigenvalues of covariance matrix (shape descriptor)
        cov_matrix = np.cov(points.T)
        eigenvalues = np.linalg.eigvalsh(cov_matrix)
        eigenvalues = np.sort(eigenvalues)[::-1]  # Sort descending

        # Normalize eigenvalues
        eigenvalues = eigenvalues / (np.sum(eigenvalues) + 1e-10)

        moments.extend(eigenvalues.tolist())

        # Total: 6 (mean + std for x,y,z) + 3 (eigenvalues) + 1 (trace) = 10
        moments.append(np.trace(cov_matrix))

        return moments[:10]  # Ensure exactly 10 values
