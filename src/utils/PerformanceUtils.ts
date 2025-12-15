/**
 * Performance utilities
 */

export class PerformanceUtils {
  private static marks: Map<string, number> = new Map();

  /**
   * Start performance measurement
   */
  static startMeasure(label: string): void {
    this.marks.set(label, performance.now());
  }

  /**
   * End performance measurement and return duration
   */
  static endMeasure(label: string): number {
    const startTime = this.marks.get(label);

    if (startTime === undefined) {
      console.warn(`Performance mark '${label}' not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    return duration;
  }

  /**
   * Measure async function execution time
   */
  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    this.startMeasure(label);
    const result = await fn();
    const duration = this.endMeasure(label);

    return { result, duration };
  }

  /**
   * Debounce function
   */
  static debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: unknown[]) => void>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Request animation frame wrapper
   */
  static requestAnimationFrame(callback: FrameRequestCallback): number {
    return window.requestAnimationFrame(callback);
  }

  /**
   * Cancel animation frame
   */
  static cancelAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id);
  }
}
