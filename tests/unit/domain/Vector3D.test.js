/**
 * Unit Tests for Vector3D Value Object
 *
 * @group unit
 * @group domain
 */

import { describe, it, expect } from 'vitest';
import { Vector3D } from '@domain/values/Vector3D.js';

describe('Vector3D', () => {
  describe('Constructor', () => {
    it('should create a vector with given coordinates', () => {
      const vector = new Vector3D(1, 2, 3);

      expect(vector.x).toBe(1);
      expect(vector.y).toBe(2);
      expect(vector.z).toBe(3);
    });

    it('should default to (0,0,0) when no arguments', () => {
      const vector = new Vector3D();

      expect(vector.x).toBe(0);
      expect(vector.y).toBe(0);
      expect(vector.z).toBe(0);
    });

    it('should be immutable', () => {
      const vector = new Vector3D(1, 2, 3);

      expect(Object.isFrozen(vector)).toBe(true);
      expect(() => {
        vector.x = 10;
      }).toThrow();
    });
  });

  describe('add()', () => {
    it('should add two vectors correctly', () => {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      const result = v1.add(v2);

      expect(result.x).toBe(5);
      expect(result.y).toBe(7);
      expect(result.z).toBe(9);
    });

    it('should not modify original vector', () => {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      v1.add(v2);

      expect(v1.x).toBe(1);
      expect(v1.y).toBe(2);
      expect(v1.z).toBe(3);
    });
  });

  describe('subtract()', () => {
    it('should subtract two vectors correctly', () => {
      const v1 = new Vector3D(5, 7, 9);
      const v2 = new Vector3D(1, 2, 3);
      const result = v1.subtract(v2);

      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
      expect(result.z).toBe(6);
    });

    it('should not modify original vector', () => {
      const v1 = new Vector3D(5, 7, 9);
      const v2 = new Vector3D(1, 2, 3);
      v1.subtract(v2);

      expect(v1.x).toBe(5);
      expect(v1.y).toBe(7);
      expect(v1.z).toBe(9);
    });
  });

  describe('multiply()', () => {
    it('should multiply vector by scalar', () => {
      const vector = new Vector3D(1, 2, 3);
      const result = vector.multiply(3);

      expect(result.x).toBe(3);
      expect(result.y).toBe(6);
      expect(result.z).toBe(9);
    });

    it('should handle negative scalar', () => {
      const vector = new Vector3D(1, 2, 3);
      const result = vector.multiply(-2);

      expect(result.x).toBe(-2);
      expect(result.y).toBe(-4);
      expect(result.z).toBe(-6);
    });

    it('should handle zero scalar', () => {
      const vector = new Vector3D(1, 2, 3);
      const result = vector.multiply(0);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('dot()', () => {
    it('should calculate dot product correctly', () => {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(4, 5, 6);
      const result = v1.dot(v2);

      // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
      expect(result).toBe(32);
    });

    it('should return 0 for perpendicular vectors', () => {
      const v1 = new Vector3D(1, 0, 0);
      const v2 = new Vector3D(0, 1, 0);
      const result = v1.dot(v2);

      expect(result).toBe(0);
    });
  });

  describe('cross()', () => {
    it('should calculate cross product correctly', () => {
      const v1 = new Vector3D(1, 0, 0);
      const v2 = new Vector3D(0, 1, 0);
      const result = v1.cross(v2);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(1);
    });

    it('should return zero vector for parallel vectors', () => {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(2, 4, 6);
      const result = v1.cross(v2);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('length()', () => {
    it('should calculate vector length correctly', () => {
      const vector = new Vector3D(3, 4, 0);
      const length = vector.length();

      expect(length).toBe(5);
    });

    it('should return 0 for zero vector', () => {
      const vector = new Vector3D(0, 0, 0);
      const length = vector.length();

      expect(length).toBe(0);
    });

    it('should calculate 3D length correctly', () => {
      const vector = new Vector3D(1, 2, 2);
      const length = vector.length();

      expect(length).toBe(3);
    });
  });

  describe('normalize()', () => {
    it('should create unit vector', () => {
      const vector = new Vector3D(3, 4, 0);
      const normalized = vector.normalize();

      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
      expect(normalized.z).toBe(0);
      expect(normalized.length()).toBeCloseTo(1);
    });

    it('should return zero vector when normalizing zero vector', () => {
      const vector = new Vector3D(0, 0, 0);
      const normalized = vector.normalize();

      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
      expect(normalized.z).toBe(0);
    });
  });

  describe('distance()', () => {
    it('should calculate distance between two vectors', () => {
      const v1 = new Vector3D(0, 0, 0);
      const v2 = new Vector3D(3, 4, 0);
      const distance = v1.distance(v2);

      expect(distance).toBe(5);
    });

    it('should return 0 for same vectors', () => {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(1, 2, 3);
      const distance = v1.distance(v2);

      expect(distance).toBe(0);
    });
  });

  describe('equals()', () => {
    it('should return true for vectors with same coordinates', () => {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(1, 2, 3);

      expect(v1.equals(v2)).toBe(true);
    });

    it('should return false for vectors with different coordinates', () => {
      const v1 = new Vector3D(1, 2, 3);
      const v2 = new Vector3D(3, 2, 1);

      expect(v1.equals(v2)).toBe(false);
    });

    it('should handle epsilon comparison', () => {
      const v1 = new Vector3D(1.0000001, 2, 3);
      const v2 = new Vector3D(1, 2, 3);

      expect(v1.equals(v2, 0.001)).toBe(true);
    });
  });

  describe('toArray()', () => {
    it('should convert to array', () => {
      const vector = new Vector3D(1, 2, 3);
      const array = vector.toArray();

      expect(array).toEqual([1, 2, 3]);
    });
  });

  describe('toJSON()', () => {
    it('should serialize to JSON', () => {
      const vector = new Vector3D(1, 2, 3);
      const json = vector.toJSON();

      expect(json).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('toString()', () => {
    it('should convert to string representation', () => {
      const vector = new Vector3D(1, 2, 3);
      const str = vector.toString();

      expect(str).toBe('Vector3D(1, 2, 3)');
    });
  });

  describe('Static Methods', () => {
    it('should create zero vector', () => {
      const zero = Vector3D.zero();

      expect(zero.x).toBe(0);
      expect(zero.y).toBe(0);
      expect(zero.z).toBe(0);
    });

    it('should create unit X vector', () => {
      const unitX = Vector3D.unitX();

      expect(unitX.x).toBe(1);
      expect(unitX.y).toBe(0);
      expect(unitX.z).toBe(0);
    });

    it('should create unit Y vector', () => {
      const unitY = Vector3D.unitY();

      expect(unitY.x).toBe(0);
      expect(unitY.y).toBe(1);
      expect(unitY.z).toBe(0);
    });

    it('should create unit Z vector', () => {
      const unitZ = Vector3D.unitZ();

      expect(unitZ.x).toBe(0);
      expect(unitZ.y).toBe(0);
      expect(unitZ.z).toBe(1);
    });

    it('should create from array', () => {
      const vector = Vector3D.fromArray([1, 2, 3]);

      expect(vector.x).toBe(1);
      expect(vector.y).toBe(2);
      expect(vector.z).toBe(3);
    });

    it('should create from JSON', () => {
      const vector = Vector3D.fromJSON({ x: 1, y: 2, z: 3 });

      expect(vector.x).toBe(1);
      expect(vector.y).toBe(2);
      expect(vector.z).toBe(3);
    });
  });
});
