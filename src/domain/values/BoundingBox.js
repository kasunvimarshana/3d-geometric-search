/**
 * BoundingBox Value Object - Represents a 3D bounding box
 * Immutable value object with geometric operations
 *
 * @class BoundingBox
 * @description Axis-aligned bounding box (AABB) for 3D objects
 */

import { Vector3D } from './Vector3D.js';

export class BoundingBox {
  /**
   * Create a new BoundingBox instance
   *
   * @param {Object|Vector3D} params - Bounding box parameters object or min Vector3D
   * @param {Vector3D} params.min - Minimum point (when params is object)
   * @param {Vector3D} params.max - Maximum point (when params is object)
   * @param {Vector3D} [max] - Maximum point (when params is Vector3D)
   */
  constructor(params, max) {
    let minVec, maxVec;

    // Support both object and positional arguments
    if (params instanceof Vector3D) {
      // Positional syntax: new BoundingBox(min, max)
      minVec = params;
      maxVec = max;
    } else if (typeof params === 'object' && params !== null) {
      // Object syntax: new BoundingBox({ min, max })
      minVec = params.min;
      maxVec = params.max;
    } else {
      throw new Error('Invalid BoundingBox constructor arguments');
    }

    if (!(minVec instanceof Vector3D)) {
      throw new Error('min must be a Vector3D');
    }
    if (!(maxVec instanceof Vector3D)) {
      throw new Error('max must be a Vector3D');
    }

    // Validate that max >= min
    if (maxVec.x < minVec.x || maxVec.y < minVec.y || maxVec.z < minVec.z) {
      throw new Error('max must be greater than or equal to min');
    }

    // Make properties immutable
    Object.defineProperties(this, {
      min: { value: minVec, enumerable: true },
      max: { value: maxVec, enumerable: true },
    });

    // Freeze the instance
    Object.freeze(this);
  }

  /**
   * Get the center point of the bounding box
   * @returns {Vector3D}
   */
  getCenter() {
    return new Vector3D({
      x: (this.min.x + this.max.x) / 2,
      y: (this.min.y + this.max.y) / 2,
      z: (this.min.z + this.max.z) / 2,
    });
  }

  /**
   * Get the size (dimensions) of the bounding box
   * @returns {Vector3D}
   */
  getSize() {
    return new Vector3D({
      x: this.max.x - this.min.x,
      y: this.max.y - this.min.y,
      z: this.max.z - this.min.z,
    });
  }

  /**
   * Get dimensions as an object
   * @returns {{width: number, height: number, depth: number}}
   */
  getDimensions() {
    const size = this.getSize();
    return {
      width: size.x,
      height: size.y,
      depth: size.z,
    };
  }

  /**
   * Get the maximum dimension
   * @returns {number}
   */
  getMaxDimension() {
    const size = this.getSize();
    return Math.max(size.x, size.y, size.z);
  }

  /**
   * Get the minimum dimension
   * @returns {number}
   */
  getMinDimension() {
    const size = this.getSize();
    return Math.min(size.x, size.y, size.z);
  }

  /**
   * Get the volume of the bounding box
   * @returns {number}
   */
  getVolume() {
    const size = this.getSize();
    return size.x * size.y * size.z;
  }

  /**
   * Get the surface area of the bounding box
   * @returns {number}
   */
  getSurfaceArea() {
    const size = this.getSize();
    return 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
  }

  /**
   * Check if a point is inside the bounding box
   *
   * @param {Vector3D} point - Point to check
   * @returns {boolean}
   */
  containsPoint(point) {
    return (
      point.x >= this.min.x &&
      point.x <= this.max.x &&
      point.y >= this.min.y &&
      point.y <= this.max.y &&
      point.z >= this.min.z &&
      point.z <= this.max.z
    );
  }

  /**
   * Check if another bounding box intersects this one
   *
   * @param {BoundingBox} other - Other bounding box
   * @returns {boolean}
   */
  intersects(other) {
    return (
      this.min.x <= other.max.x &&
      this.max.x >= other.min.x &&
      this.min.y <= other.max.y &&
      this.max.y >= other.min.y &&
      this.min.z <= other.max.z &&
      this.max.z >= other.min.z
    );
  }

  /**
   * Check if this bounding box contains another
   *
   * @param {BoundingBox} other - Other bounding box
   * @returns {boolean}
   */
  contains(other) {
    return (
      this.min.x <= other.min.x &&
      this.max.x >= other.max.x &&
      this.min.y <= other.min.y &&
      this.max.y >= other.max.y &&
      this.min.z <= other.min.z &&
      this.max.z >= other.max.z
    );
  }

  /**
   * Expand bounding box by a margin
   *
   * @param {number} margin - Margin to add on all sides
   * @returns {BoundingBox}
   */
  expand(margin) {
    return new BoundingBox({
      min: new Vector3D({
        x: this.min.x - margin,
        y: this.min.y - margin,
        z: this.min.z - margin,
      }),
      max: new Vector3D({
        x: this.max.x + margin,
        y: this.max.y + margin,
        z: this.max.z + margin,
      }),
    });
  }

  /**
   * Merge with another bounding box
   *
   * @param {BoundingBox} other - Other bounding box
   * @returns {BoundingBox}
   */
  merge(other) {
    return new BoundingBox({
      min: new Vector3D({
        x: Math.min(this.min.x, other.min.x),
        y: Math.min(this.min.y, other.min.y),
        z: Math.min(this.min.z, other.min.z),
      }),
      max: new Vector3D({
        x: Math.max(this.max.x, other.max.x),
        y: Math.max(this.max.y, other.max.y),
        z: Math.max(this.max.z, other.max.z),
      }),
    });
  }

  /**
   * Check equality with another bounding box
   *
   * @param {BoundingBox} other - Other bounding box
   * @returns {boolean}
   */
  equals(other) {
    return this.min.equals(other.min) && this.max.equals(other.max);
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      min: this.min.toJSON(),
      max: this.max.toJSON(),
      center: this.getCenter().toJSON(),
      dimensions: this.getDimensions(),
      volume: this.getVolume(),
    };
  }

  /**
   * Create BoundingBox from plain object
   *
   * @param {Object} data - Plain object data
   * @returns {BoundingBox}
   */
  static fromJSON(data) {
    return new BoundingBox({
      min: Vector3D.fromJSON(data.min),
      max: Vector3D.fromJSON(data.max),
    });
  }

  /**
   * Create a clone of the bounding box
   * @returns {BoundingBox}
   */
  clone() {
    return new BoundingBox({
      min: this.min.clone(),
      max: this.max.clone(),
    });
  }

  /**
   * Create bounding box from center and size
   *
   * @param {Vector3D} center - Center point
   * @param {Vector3D} size - Size dimensions
   * @returns {BoundingBox}
   */
  static fromCenterAndSize(center, size) {
    const halfSize = size.scale(0.5);
    return new BoundingBox({
      min: center.subtract(halfSize),
      max: center.add(halfSize),
    });
  }

  /**
   * Create bounding box from array of points
   *
   * @param {Vector3D[]} points - Array of points
   * @returns {BoundingBox}
   */
  static fromPoints(points) {
    if (!points || points.length === 0) {
      throw new Error('Cannot create bounding box from empty points array');
    }

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      minZ = Math.min(minZ, point.z);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
      maxZ = Math.max(maxZ, point.z);
    }

    return new BoundingBox({
      min: new Vector3D({ x: minX, y: minY, z: minZ }),
      max: new Vector3D({ x: maxX, y: maxY, z: maxZ }),
    });
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    return `BoundingBox(min=${this.min.toString()}, max=${this.max.toString()})`;
  }
}
