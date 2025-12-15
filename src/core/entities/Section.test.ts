import { describe, it, expect } from "vitest";
import { Section } from "@core/entities/Section";

describe("Section Entity", () => {
  describe("constructor", () => {
    it("should create a section with required properties", () => {
      const section = new Section({ name: "Test Section" });

      expect(section.name).toBe("Test Section");
      expect(section.visible).toBe(true);
      expect(section.selectable).toBe(true);
      expect(section.children).toEqual([]);
      expect(section.geometryIds).toEqual([]);
    });

    it("should create a section with custom properties", () => {
      const section = new Section({
        name: "Custom Section",
        visible: false,
        selectable: false,
      });

      expect(section.visible).toBe(false);
      expect(section.selectable).toBe(false);
    });
  });

  describe("child management", () => {
    it("should add a child", () => {
      const parent = new Section({ name: "Parent" });
      const childId = "child-123";

      parent.addChild(childId);

      expect(parent.children).toContain(childId);
      expect(parent.hasChild(childId)).toBe(true);
    });

    it("should remove a child", () => {
      const parent = new Section({ name: "Parent" });
      const childId = "child-123";

      parent.addChild(childId);
      parent.removeChild(childId);

      expect(parent.children).not.toContain(childId);
      expect(parent.hasChild(childId)).toBe(false);
    });
  });

  describe("geometry management", () => {
    it("should add geometry", () => {
      const section = new Section({ name: "Test" });
      const geomId = "geom-123";

      section.addGeometry(geomId);

      expect(section.geometryIds).toContain(geomId);
    });

    it("should remove geometry", () => {
      const section = new Section({ name: "Test" });
      const geomId = "geom-123";

      section.addGeometry(geomId);
      section.removeGeometry(geomId);

      expect(section.geometryIds).not.toContain(geomId);
    });
  });

  describe("visibility", () => {
    it("should toggle visibility", () => {
      const section = new Section({ name: "Test" });

      expect(section.visible).toBe(true);

      section.setVisible(false);
      expect(section.visible).toBe(false);

      section.setVisible(true);
      expect(section.visible).toBe(true);
    });
  });

  describe("serialization", () => {
    it("should serialize to JSON", () => {
      const section = new Section({
        name: "Test Section",
        visible: false,
      });

      const json = section.toJSON();

      expect(json.name).toBe("Test Section");
      expect(json.visible).toBe(false);
      expect(json.children).toEqual([]);
    });
  });
});
