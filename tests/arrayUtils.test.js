import { describe, it, expect } from "vitest";
import { arraysAlmostEqual } from "../src/presentation/utils/arrayUtils.js";

describe("arraysAlmostEqual", () => {
  it("returns true for identical arrays", () => {
    expect(arraysAlmostEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("returns true within epsilon tolerance", () => {
    expect(arraysAlmostEqual([1, 2, 3.0000005], [1, 2, 3.0000006])).toBe(true);
  });

  it("returns false when outside epsilon", () => {
    expect(arraysAlmostEqual([1, 2, 3.001], [1, 2, 3])).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(arraysAlmostEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("returns false for non-finite values", () => {
    expect(arraysAlmostEqual([1, Infinity, 3], [1, Infinity, 3])).toBe(false);
  });
});
