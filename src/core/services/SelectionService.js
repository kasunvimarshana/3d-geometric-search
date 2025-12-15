/**
 * Selection Service
 *
 * Business logic for selection operations including validation
 * and selection state management.
 */
export class SelectionService {
  /**
   * Validate selection
   */
  validateSelection(selection, model) {
    const errors = [];
    const validIds = new Set(model.getAllSections().map((s) => s.id));

    // Validate selected IDs
    for (const id of selection.selectedIds) {
      if (!validIds.has(id)) {
        errors.push(`Invalid selected section ID: ${id}`);
      }
    }

    // Validate highlighted IDs
    for (const id of selection.highlightedIds) {
      if (!validIds.has(id)) {
        errors.push(`Invalid highlighted section ID: ${id}`);
      }
    }

    // Validate focused ID
    if (selection.focusedId && !validIds.has(selection.focusedId)) {
      errors.push(`Invalid focused section ID: ${selection.focusedId}`);
    }

    // Validate isolated IDs
    for (const id of selection.isolatedIds) {
      if (!validIds.has(id)) {
        errors.push(`Invalid isolated section ID: ${id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Select section with children
   */
  selectWithChildren(selection, section) {
    const newSelection = selection.clone();
    newSelection.select(section.id);

    const addChildren = (s) => {
      s.children?.forEach((child) => {
        newSelection.select(child.id, true);
        addChildren(child);
      });
    };

    addChildren(section);
    return newSelection;
  }

  /**
   * Get visible section IDs based on isolation
   */
  getVisibleSectionIds(selection, model) {
    if (selection.hasIsolation()) {
      return Array.from(selection.isolatedIds);
    }
    return model.getAllSections().map((s) => s.id);
  }

  /**
   * Check if selection should focus camera
   */
  shouldFocusCamera(selection) {
    return selection.focusedId !== null || selection.getSelectedCount() > 0;
  }
}
