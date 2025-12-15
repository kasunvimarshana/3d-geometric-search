import { describe, it, expect } from "vitest";
import { buildModelTree } from "../src/core/domain/modelTree.js";

function fakeNode(id, name, children = []) {
  return {
    userData: { __nodeId: id },
    name,
    type: "Group",
    isObject3D: true,
    children,
  };
}

describe("buildModelTree", () => {
  it("builds nested tree structure with ids and names", () => {
    const root = fakeNode("n1", "root", [
      fakeNode("n2", "childA", [fakeNode("n3", "grand")]),
      fakeNode("n4", "childB"),
    ]);
    const tree = buildModelTree(root);
    expect(tree.id).toBe("n1");
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].children[0].name).toBe("grand");
  });
});
