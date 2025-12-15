import { ISectionManager } from "@domain/interfaces";
import { Model, ModelSection } from "@domain/types";

/**
 * Section Manager
 * Manages section hierarchy and operations
 * Provides navigation and selection functionality
 */
export class SectionManager implements ISectionManager {
  private model?: Model;

  constructor(model?: Model) {
    this.model = model;
  }

  /**
   * Set the current model
   */
  setModel(model: Model): void {
    this.model = model;
  }

  /**
   * Get section by ID
   */
  getSectionById(id: string): ModelSection {
    if (!this.model) {
      throw new Error("No model loaded");
    }

    const section = this.model.sections.get(id);
    if (!section) {
      throw new Error(`Section not found: ${id}`);
    }

    return section;
  }

  /**
   * Get parent section
   */
  getParentSection(sectionId: string): ModelSection | undefined {
    const section = this.getSectionById(sectionId);

    if (!section.parentId) {
      return undefined;
    }

    return this.model!.sections.get(section.parentId);
  }

  /**
   * Get child sections
   */
  getChildSections(sectionId: string): ModelSection[] {
    const section = this.getSectionById(sectionId);

    return section.childIds
      .map((id) => this.model!.sections.get(id))
      .filter((s): s is ModelSection => s !== undefined);
  }

  /**
   * Get root sections
   */
  getRootSections(): ModelSection[] {
    if (!this.model) {
      return [];
    }

    return this.model.rootSectionIds
      .map((id) => this.model!.sections.get(id))
      .filter((s): s is ModelSection => s !== undefined);
  }

  /**
   * Get all ancestor sections
   */
  getAncestors(sectionId: string): ModelSection[] {
    const ancestors: ModelSection[] = [];
    let current = this.getSectionById(sectionId);

    while (current.parentId) {
      const parent = this.model!.sections.get(current.parentId);
      if (!parent) break;

      ancestors.push(parent);
      current = parent;
    }

    return ancestors;
  }

  /**
   * Get all descendant sections
   */
  getDescendants(sectionId: string): ModelSection[] {
    const descendants: ModelSection[] = [];
    const queue = [sectionId];

    while (queue.length > 0) {
      const id = queue.shift()!;
      const section = this.model!.sections.get(id);

      if (section) {
        section.childIds.forEach((childId) => {
          const child = this.model!.sections.get(childId);
          if (child) {
            descendants.push(child);
            queue.push(childId);
          }
        });
      }
    }

    return descendants;
  }

  /**
   * Select section
   */
  selectSection(sectionId: string, multi = false): void {
    if (!this.model) return;

    if (!multi) {
      // Deselect all
      this.model.sections.forEach((section) => {
        section.selected = false;
      });
    }

    const section = this.model.sections.get(sectionId);
    if (section) {
      section.selected = true;
    }
  }

  /**
   * Deselect section
   */
  deselectSection(sectionId?: string): void {
    if (!this.model) return;

    if (sectionId) {
      const section = this.model.sections.get(sectionId);
      if (section) {
        section.selected = false;
      }
    } else {
      // Deselect all
      this.model.sections.forEach((section) => {
        section.selected = false;
      });
    }
  }

  /**
   * Get selected sections
   */
  getSelectedSections(): string[] {
    if (!this.model) return [];

    return Array.from(this.model.sections.values())
      .filter((section) => section.selected)
      .map((section) => section.id);
  }

  /**
   * Check if section exists
   */
  hasSection(sectionId: string): boolean {
    return this.model?.sections.has(sectionId) || false;
  }

  /**
   * Get section count
   */
  getSectionCount(): number {
    return this.model?.sections.size || 0;
  }
}
