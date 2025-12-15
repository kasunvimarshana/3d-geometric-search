import { describe, it, expect } from "vitest";
import { Model } from "@core/entities/Model";
import { Section } from "@core/entities/Section";
import { ModelFormat } from "@shared/types/enums";

describe("Model Entity", () => {
  describe("constructor", () => {
    it("should create a model with metadata", () => {
      const model = new Model({
        name: "Test Model",
        format: ModelFormat.GLTF,
        fileSize: 1024,
        createdAt: new Date(),
      });

      expect(model.metadata.name).toBe("Test Model");
      expect(model.metadata.format).toBe(ModelFormat.GLTF);
      expect(model.metadata.fileSize).toBe(1024);
    });
  });

  describe("section management", () => {
    it("should add a section", () => {
      const model = new Model({
        name: "Test",
        format: ModelFormat.GLTF,
        fileSize: 0,
        createdAt: new Date(),
      });

      const section = new Section({ name: "Section 1" });
      model.addSection(section);

      expect(model.getSection(section.id)).toBe(section);
    });

    it("should remove a section", () => {
      const model = new Model({
        name: "Test",
        format: ModelFormat.GLTF,
        fileSize: 0,
        createdAt: new Date(),
      });

      const section = new Section({ name: "Section 1" });
      model.addSection(section);
      model.removeSection(section.id);

      expect(model.getSection(section.id)).toBeUndefined();
    });

    it("should track root sections", () => {
      const model = new Model({
        name: "Test",
        format: ModelFormat.GLTF,
        fileSize: 0,
        createdAt: new Date(),
      });

      const root1 = new Section({ name: "Root 1" });
      const root2 = new Section({ name: "Root 2" });

      model.addSection(root1);
      model.addSection(root2);

      expect(model.rootSectionIds).toContain(root1.id);
      expect(model.rootSectionIds).toContain(root2.id);
      expect(model.rootSectionIds.length).toBe(2);
    });
  });

  describe("hierarchy traversal", () => {
    it("should get ancestors of a section", () => {
      const model = new Model({
        name: "Test",
        format: ModelFormat.GLTF,
        fileSize: 0,
        createdAt: new Date(),
      });

      const grandparent = new Section({ name: "Grandparent" });
      const parent = new Section({
        name: "Parent",
        parentId: grandparent.id,
      });
      const child = new Section({ name: "Child", parentId: parent.id });

      grandparent.addChild(parent.id);
      parent.addChild(child.id);

      model.addSection(grandparent);
      model.addSection(parent);
      model.addSection(child);

      const ancestors = model.getAncestors(child.id);

      expect(ancestors.length).toBe(2);
      expect(ancestors[0].id).toBe(grandparent.id);
      expect(ancestors[1].id).toBe(parent.id);
    });

    it("should get descendants of a section", () => {
      const model = new Model({
        name: "Test",
        format: ModelFormat.GLTF,
        fileSize: 0,
        createdAt: new Date(),
      });

      const parent = new Section({ name: "Parent" });
      const child1 = new Section({ name: "Child 1", parentId: parent.id });
      const child2 = new Section({ name: "Child 2", parentId: parent.id });

      parent.addChild(child1.id);
      parent.addChild(child2.id);

      model.addSection(parent);
      model.addSection(child1);
      model.addSection(child2);

      const descendants = model.getDescendants(parent.id);

      expect(descendants.length).toBe(2);
      expect(descendants.map((d) => d.id)).toContain(child1.id);
      expect(descendants.map((d) => d.id)).toContain(child2.id);
    });
  });
});
