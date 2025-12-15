import { Model } from "@core/entities/Model";
import { UUID } from "@shared/types/interfaces";
import { EventBus, SectionSelectedEvent } from "@domain/events/DomainEvents";

/**
 * Use case for managing section selection
 * Follows Single Responsibility Principle
 */
export class ManageSelectionUseCase {
  private selectedIds: Set<UUID> = new Set();

  constructor(private readonly eventBus: EventBus) {}

  /**
   * Select sections
   */
  async select(
    model: Model,
    sectionIds: UUID[],
    clearPrevious: boolean = true
  ): Promise<void> {
    const previousIds = Array.from(this.selectedIds);

    if (clearPrevious) {
      this.selectedIds.clear();
    }

    // Validate and add selections
    sectionIds.forEach((id) => {
      const section = model.getSection(id);
      if (section && section.selectable) {
        this.selectedIds.add(id);
      }
    });

    // Publish event
    await this.eventBus.publish(
      new SectionSelectedEvent(Array.from(this.selectedIds), previousIds)
    );
  }

  /**
   * Deselect sections
   */
  async deselect(sectionIds: UUID[]): Promise<void> {
    const previousIds = Array.from(this.selectedIds);

    sectionIds.forEach((id) => {
      this.selectedIds.delete(id);
    });

    await this.eventBus.publish(
      new SectionSelectedEvent(Array.from(this.selectedIds), previousIds)
    );
  }

  /**
   * Toggle section selection
   */
  async toggle(model: Model, sectionId: UUID): Promise<void> {
    if (this.selectedIds.has(sectionId)) {
      await this.deselect([sectionId]);
    } else {
      await this.select(model, [sectionId], false);
    }
  }

  /**
   * Clear all selections
   */
  async clear(): Promise<void> {
    const previousIds = Array.from(this.selectedIds);
    this.selectedIds.clear();

    await this.eventBus.publish(new SectionSelectedEvent([], previousIds));
  }

  /**
   * Get selected section IDs
   */
  getSelected(): UUID[] {
    return Array.from(this.selectedIds);
  }

  /**
   * Check if a section is selected
   */
  isSelected(sectionId: UUID): boolean {
    return this.selectedIds.has(sectionId);
  }

  /**
   * Select all sections
   */
  async selectAll(model: Model): Promise<void> {
    const allIds = model
      .getAllSections()
      .filter((s) => s.selectable)
      .map((s) => s.id);
    await this.select(model, allIds, true);
  }

  /**
   * Select section and its descendants
   */
  async selectWithDescendants(model: Model, sectionId: UUID): Promise<void> {
    const section = model.getSection(sectionId);
    if (!section) return;

    const descendants = model.getDescendants(sectionId);
    const ids = [sectionId, ...descendants.map((d) => d.id)];
    await this.select(model, ids, false);
  }
}
