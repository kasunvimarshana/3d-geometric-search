import { UUID } from "@shared/types/interfaces";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique identifier
 */
export function generateId(): UUID {
  return uuidv4();
}

/**
 * Check if a value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : "";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Assert that a value is defined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = "Value is not defined"
): asserts value is T {
  if (!isDefined(value)) {
    throw new Error(message);
  }
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Check if two sets are equal
 */
export function setsAreEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

/**
 * Get the difference between two sets
 */
export function setDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
  const diff = new Set<T>();
  for (const item of a) {
    if (!b.has(item)) diff.add(item);
  }
  return diff;
}

/**
 * Get the intersection of two sets
 */
export function setIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  const intersection = new Set<T>();
  for (const item of a) {
    if (b.has(item)) intersection.add(item);
  }
  return intersection;
}
