export function computeMetrics(root) {
  if (!root) return { nodes: 0, meshes: 0, triangles: 0 };
  let nodes = 0;
  let meshes = 0;
  let triangles = 0;
  root.traverse((obj) => {
    nodes += 1;
    if (obj.isMesh && obj.geometry) {
      meshes += 1;
      const geom = obj.geometry;
      if (geom.index && geom.index.count)
        triangles += Math.floor(geom.index.count / 3);
      else if (geom.attributes?.position?.count)
        triangles += Math.floor(geom.attributes.position.count / 3);
    }
  });
  return { nodes, meshes, triangles };
}
