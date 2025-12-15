export function buildModelTree(root) {
  const toNode = (obj) => ({
    id: obj.userData.__nodeId,
    name: obj.name || obj.type,
    children: obj.children.filter((c) => c.isObject3D).map(toNode),
  });
  return toNode(root);
}
