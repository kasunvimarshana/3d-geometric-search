import { describe, it, expect } from "vitest";
import {
  generateId,
  isValidUUID,
  formatFileSize,
  getFileExtension,
  clamp,
  lerp,
} from "@shared/utils/helpers";

describe("Utility Functions", () => {
  describe("generateId", () => {
    it("should generate a valid UUID", () => {
      const id = generateId();
      expect(isValidUUID(id)).toBe(true);
    });

    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should handle decimal values", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe("1.5 MB");
    });
  });

  describe("getFileExtension", () => {
    it("should extract file extension", () => {
      expect(getFileExtension("model.gltf")).toBe(".gltf");
      expect(getFileExtension("archive.tar.gz")).toBe(".gz");
      expect(getFileExtension("no-extension")).toBe("");
    });

    it("should return lowercase extension", () => {
      expect(getFileExtension("MODEL.GLTF")).toBe(".gltf");
    });
  });

  describe("clamp", () => {
    it("should clamp values within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("lerp", () => {
    it("should interpolate between values", () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });
});
