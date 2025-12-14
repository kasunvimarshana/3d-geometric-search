/**
 * Vector3D Value Object - Represents a 3D vector/point
 * Immutable value object with vector operations
 *
 * @class Vector3D
 * @description Three-dimensional vector with mathematical operations
 */

export class Vector3D {
  /**
   * Create a new Vector3D instance
   *
   * @param {Object|number} params - Vector parameters object or x coordinate
   * @param {number} params.x - X coordinate (when params is object)
   * @param {number} params.y - Y coordinate (when params is object)
   * @param {number} params.z - Z coordinate (when params is object)
   * @param {number} [y] - Y coordinate (when params is number)
   * @param {number} [z] - Z coordinate (when params is number)
   */
  constructor(params, y, z) {
    let x, yVal, zVal;

    // Support both object and positional arguments
    if (typeof params === 'object' && params !== null) {
      // Object syntax: new Vector3D({ x, y, z })
      x = params.x ?? 0;
      yVal = params.y ?? 0;
      zVal = params.z ?? 0;
    } else {
      // Positional syntax: new Vector3D(x, y, z) or new Vector3D()
      x = params ?? 0;
      yVal = y ?? 0;
      zVal = z ?? 0;
    }

    // Validate and coerce to numbers
    const numX = Number(x);
    const numY = Number(yVal);
    const numZ = Number(zVal);

    if (!Number.isFinite(numX)) throw new Error('x must be a finite number');
    if (!Number.isFinite(numY)) throw new Error('y must be a finite number');
    if (!Number.isFinite(numZ)) throw new Error('z must be a finite number');

    // Make properties immutable
    Object.defineProperties(this, {
      x: { value: numX, enumerable: true },
      y: { value: numY, enumerable: true },
      z: { value: numZ, enumerable: true },
    });

    // Freeze the instance
    Object.freeze(this);
  }

  /**
   * Add another vector
   * @param {Vector3D} other - Vector to add
   * @returns {Vector3D}
   */
  add(other) {
    return new Vector3D({
      x: this.x + other.x,
      y: this.y + other.y,
      z: this.z + other.z,
    });
  }

  /**
   * Subtract another vector
   * @param {Vector3D} other - Vector to subtract
   * @returns {Vector3D}
   */
  subtract(other) {
    return new Vector3D({
      x: this.x - other.x,
      y: this.y - other.y,
      z: this.z - other.z,
    });
  }

  /**
   * Multiply by scalar
   * @param {number} scalar - Scalar value
   * @returns {Vector3D}
   */
  scale(scalar) {
    return new Vector3D({
      x: this.x * scalar,
      y: this.y * scalar,
      z: this.z * scalar,
    });
  }

  /**
   * Alias for scale (for compatibility)
   * @param {number} scalar - Scalar value
   * @returns {Vector3D}
   */
  multiply(scalar) {
    return this.scale(scalar);
  }

  /**
   * Divide by scalar
   * @param {number} scalar - Scalar value
   * @returns {Vector3D}
   */
  divide(scalar) {
    if (scalar === 0) throw new Error('Cannot divide by zero');
    return new Vector3D({
      x: this.x / scalar,
      y: this.y / scalar,
      z: this.z / scalar,
    });
  }

  /**
   * Calculate dot product with another vector
   * @param {Vector3D} other - Other vector
   * @returns {number}
   */
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  /**
   * Calculate cross product with another vector
   * @param {Vector3D} other - Other vector
   * @returns {Vector3D}
   */
  cross(other) {
    return new Vector3D({
      x: this.y * other.z - this.z * other.y,
      y: this.z * other.x - this.x * other.z,
      z: this.x * other.y - this.y * other.x,
    });
  }

  /**
   * Calculate length (magnitude) of the vector
   * @returns {number}
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Calculate squared length (faster than length())
   * @returns {number}
   */
  lengthSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Normalize the vector (length = 1)
   * @returns {Vector3D}
   */
  normalize() {
    const len = this.length();
    if (len === 0) {
      return new Vector3D({ x: 0, y: 0, z: 0 });
    }
    return this.divide(len);
  }

  /**
   * Calculate distance to another vector
   * @param {Vector3D} other - Other vector
   * @returns {number}
   */
  distanceTo(other) {
    return this.subtract(other).length();
  }

  /**
   * Alias for distanceTo (for compatibility)
   * @param {Vector3D} other - Other vector
   * @returns {number}
   */
  distance(other) {
    return this.distanceTo(other);
  }

  /**
   * Calculate squared distance to another vector
   * @param {Vector3D} other - Other vector
   * @returns {number}
   */
  distanceToSquared(other) {
    return this.subtract(other).lengthSquared();
  }

  /**
   * Negate the vector
   * @returns {Vector3D}
   */
  negate() {
    return new Vector3D({
      x: -this.x,
      y: -this.y,
      z: -this.z,
    });
  }

  /**
   * Linear interpolation to another vector
   * @param {Vector3D} other - Target vector
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Vector3D}
   */
  lerp(other, t) {
    return new Vector3D({
      x: this.x + (other.x - this.x) * t,
      y: this.y + (other.y - this.y) * t,
      z: this.z + (other.z - this.z) * t,
    });
  }

  /**
   * Check if vector is zero
   * @returns {boolean}
   */
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  /**
   * Check equality with another vector
   * @param {Vector3D} other - Other vector
   * @param {number} [epsilon=1e-10] - Tolerance for floating point comparison
   * @returns {boolean}
   */
  equals(other, epsilon = 1e-10) {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  /**
   * Convert to array
   * @returns {number[]}
   */
  toArray() {
    return [this.x, this.y, this.z];
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }

  /**
   * Create Vector3D from plain object
   * @param {Object} data - Plain object with x, y, z properties
   * @returns {Vector3D}
   */
  static fromJSON(data) {
    return new Vector3D({
      x: data.x,
      y: data.y,
      z: data.z,
    });
  }

  /**
   * Create Vector3D from array
   * @param {number[]} array - Array with [x, y, z]
   * @returns {Vector3D}
   */
  static fromArray(array) {
    return new Vector3D({
      x: array[0],
      y: array[1],
      z: array[2],
    });
  }

  /**
   * Create a clone of the vector
   * @returns {Vector3D}
   */
  clone() {
    return new Vector3D({
      x: this.x,
      y: this.y,
      z: this.z,
    });
  }

  /**
   * Create zero vector
   * @returns {Vector3D}
   */
  static zero() {
    return new Vector3D({ x: 0, y: 0, z: 0 });
  }

  /**
   * Create unit X vector
   * @returns {Vector3D}
   */
  static unitX() {
    return new Vector3D({ x: 1, y: 0, z: 0 });
  }

  /**
   * Create unit Y vector
   * @returns {Vector3D}
   */
  static unitY() {
    return new Vector3D({ x: 0, y: 1, z: 0 });
  }

  /**
   * Create unit Z vector
   * @returns {Vector3D}
   */
  static unitZ() {
    return new Vector3D({ x: 0, y: 0, z: 1 });
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    // Format numbers without trailing zeros
    const formatNum = n => {
      return Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/\.?0+$/, '');
    };
    return `Vector3D(${formatNum(this.x)}, ${formatNum(this.y)}, ${formatNum(this.z)})`;
  }
}
