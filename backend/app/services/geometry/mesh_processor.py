import numpy as np
import trimesh
import open3d as o3d
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class MeshProcessor:
    """Process and normalize 3D meshes"""

    def __init__(self, normalize: bool = True):
        self.normalize = normalize

    def load_mesh(
        self, file_path: str
    ) -> Tuple[Optional[trimesh.Trimesh], Optional[o3d.geometry.TriangleMesh]]:
        """
        Load a mesh file and convert to both trimesh and Open3D formats

        Args:
            file_path: Path to the mesh file

        Returns:
            Tuple of (trimesh object, Open3D mesh object)
        """
        try:
            # Load with trimesh (supports many formats)
            mesh_trimesh = trimesh.load(file_path, force="mesh")

            # Ensure it's a valid mesh
            if not isinstance(mesh_trimesh, trimesh.Trimesh):
                if isinstance(mesh_trimesh, trimesh.Scene):
                    # If it's a scene, try to get the geometry
                    mesh_trimesh = trimesh.util.concatenate(
                        tuple(
                            trimesh.Trimesh(vertices=g.vertices, faces=g.faces)
                            for g in mesh_trimesh.geometry.values()
                        )
                    )
                else:
                    raise ValueError("Unable to load mesh from file")

            # Convert to Open3D
            mesh_o3d = self._trimesh_to_open3d(mesh_trimesh)

            # Normalize if requested
            if self.normalize:
                mesh_trimesh = self._normalize_trimesh(mesh_trimesh)
                mesh_o3d = self._normalize_open3d(mesh_o3d)

            logger.info(
                f"Loaded mesh: {len(mesh_trimesh.vertices)} vertices, {len(mesh_trimesh.faces)} faces"
            )

            return mesh_trimesh, mesh_o3d

        except Exception as e:
            logger.error(f"Error loading mesh from {file_path}: {str(e)}")
            return None, None

    def _trimesh_to_open3d(self, mesh: trimesh.Trimesh) -> o3d.geometry.TriangleMesh:
        """Convert trimesh to Open3D mesh"""
        mesh_o3d = o3d.geometry.TriangleMesh()
        mesh_o3d.vertices = o3d.utility.Vector3dVector(mesh.vertices)
        mesh_o3d.triangles = o3d.utility.Vector3iVector(mesh.faces)

        # Compute normals
        mesh_o3d.compute_vertex_normals()

        return mesh_o3d

    def _normalize_trimesh(self, mesh: trimesh.Trimesh) -> trimesh.Trimesh:
        """
        Normalize mesh: center at origin and scale to unit sphere

        Args:
            mesh: Input trimesh

        Returns:
            Normalized trimesh
        """
        # Center at origin
        mesh.vertices -= mesh.centroid

        # Scale to unit sphere
        max_distance = np.max(np.linalg.norm(mesh.vertices, axis=1))
        if max_distance > 0:
            mesh.vertices /= max_distance

        return mesh

    def _normalize_open3d(
        self, mesh: o3d.geometry.TriangleMesh
    ) -> o3d.geometry.TriangleMesh:
        """Normalize Open3D mesh"""
        # Center at origin
        center = mesh.get_center()
        mesh.translate(-center)

        # Scale to unit sphere
        vertices = np.asarray(mesh.vertices)
        max_distance = np.max(np.linalg.norm(vertices, axis=1))
        if max_distance > 0:
            mesh.scale(1.0 / max_distance, center=np.array([0, 0, 0]))

        return mesh

    def get_basic_properties(self, mesh: trimesh.Trimesh) -> dict:
        """
        Extract basic geometric properties from mesh

        Args:
            mesh: Input trimesh

        Returns:
            Dictionary with geometric properties
        """
        properties = {
            "vertex_count": len(mesh.vertices),
            "face_count": len(mesh.faces),
            "volume": float(mesh.volume) if mesh.is_watertight else 0.0,
            "surface_area": float(mesh.area),
            "bounding_box": {
                "min": mesh.bounds[0].tolist(),
                "max": mesh.bounds[1].tolist(),
            },
        }

        # Compute compactness (sphericity)
        # Compactness = (36π * V²)^(1/3) / A
        # Perfect sphere = 1.0, other shapes < 1.0
        if mesh.is_watertight and mesh.volume > 0:
            compactness = (36 * np.pi * mesh.volume**2) ** (1 / 3) / mesh.area
            properties["compactness"] = float(compactness)
        else:
            properties["compactness"] = 0.0

        return properties

    def sample_points(self, mesh: trimesh.Trimesh, n_points: int = 10000) -> np.ndarray:
        """
        Sample points from mesh surface

        Args:
            mesh: Input mesh
            n_points: Number of points to sample

        Returns:
            Array of sampled points (n_points, 3)
        """
        points, _ = trimesh.sample.sample_surface(mesh, n_points)
        return points
