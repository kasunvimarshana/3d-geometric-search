/**
 * Selection entity
 * Tracks selected sections and provides selection operations
 */
export class Selection {
  constructor() {
    this.items = new Set();
    this.mode = 'single'; // 'single', 'multiple'
  }

  add(sectionId) {
    if (this.mode === 'single') {
      this.items.clear();
    }
    this.items.add(sectionId);
  }

  remove(sectionId) {
    this.items.delete(sectionId);
  }

  clear() {
    this.items.clear();
  }

  has(sectionId) {
    return this.items.has(sectionId);
  }

  getAll() {
    return Array.from(this.items);
  }

  isEmpty() {
    return this.items.size === 0;
  }

  setMode(mode) {
    if (!['single', 'multiple'].includes(mode)) {
      throw new Error('Invalid selection mode');
    }
    this.mode = mode;
    if (mode === 'single' && this.items.size > 1) {
      const first = Array.from(this.items)[0];
      this.items.clear();
      this.items.add(first);
    }
  }

  clone() {
    const cloned = new Selection();
    cloned.items = new Set(this.items);
    cloned.mode = this.mode;
    return cloned;
  }
}
