/**
 * Selection Entity
 *
 * Represents the current selection state including selected sections,
 * highlighted sections, and focus state.
 */
export class Selection {
  constructor({ selectedIds = [], highlightedIds = [], focusedId = null, isolatedIds = [] } = {}) {
    this.selectedIds = new Set(selectedIds);
    this.highlightedIds = new Set(highlightedIds);
    this.focusedId = focusedId;
    this.isolatedIds = new Set(isolatedIds);
  }

  /**
   * Select a section
   */
  select(sectionId, multiSelect = false) {
    if (!multiSelect) {
      this.selectedIds.clear();
    }
    this.selectedIds.add(sectionId);
    return this;
  }

  /**
   * Deselect a section
   */
  deselect(sectionId) {
    this.selectedIds.delete(sectionId);
    return this;
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectedIds.clear();
    return this;
  }

  /**
   * Check if section is selected
   */
  isSelected(sectionId) {
    return this.selectedIds.has(sectionId);
  }

  /**
   * Highlight a section
   */
  highlight(sectionId) {
    this.highlightedIds.add(sectionId);
    return this;
  }

  /**
   * Remove highlight
   */
  dehighlight(sectionId) {
    this.highlightedIds.delete(sectionId);
    return this;
  }

  /**
   * Clear all highlights
   */
  clearHighlights() {
    this.highlightedIds.clear();
    return this;
  }

  /**
   * Check if section is highlighted
   */
  isHighlighted(sectionId) {
    return this.highlightedIds.has(sectionId);
  }

  /**
   * Set focused section
   */
  focus(sectionId) {
    this.focusedId = sectionId;
    return this;
  }

  /**
   * Clear focus
   */
  clearFocus() {
    this.focusedId = null;
    return this;
  }

  /**
   * Check if section is focused
   */
  isFocused(sectionId) {
    return this.focusedId === sectionId;
  }

  /**
   * Isolate sections
   */
  isolate(sectionIds) {
    this.isolatedIds = new Set(sectionIds);
    return this;
  }

  /**
   * Clear isolation
   */
  clearIsolation() {
    this.isolatedIds.clear();
    return this;
  }

  /**
   * Check if any sections are isolated
   */
  hasIsolation() {
    return this.isolatedIds.size > 0;
  }

  /**
   * Check if section is isolated
   */
  isIsolated(sectionId) {
    return this.isolatedIds.has(sectionId);
  }

  /**
   * Get selected count
   */
  getSelectedCount() {
    return this.selectedIds.size;
  }

  /**
   * Clone selection
   */
  clone() {
    return new Selection({
      selectedIds: Array.from(this.selectedIds),
      highlightedIds: Array.from(this.highlightedIds),
      focusedId: this.focusedId,
      isolatedIds: Array.from(this.isolatedIds),
    });
  }
}
