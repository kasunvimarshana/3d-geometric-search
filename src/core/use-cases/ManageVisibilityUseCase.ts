import { Model } from "@core/entities/Model";
import { UUID } from "@shared/types/interfaces";
import {
  EventBus,
  SectionVisibilityChangedEvent,
  SectionIsolatedEvent,
} from "@domain/events/DomainEvents";

/**
 * Use case for managing section visibility
 * Follows Single Responsibility Principle
 */
export class ManageVisibilityUseCase {
  constructor(private readonly eventBus: EventBus) {}

  /**
   * Show sections
   */
  async show(model: Model, sectionIds: UUID[]): Promise<void> {
    for (const id of sectionIds) {
      const section = model.getSection(id);
      if (section) {
        section.setVisible(true);
        await this.eventBus.publish(
          new SectionVisibilityChangedEvent(id, true)
        );

        // Also show descendants
        const descendants = model.getDescendants(id);
        for (const desc of descendants) {
          desc.setVisible(true);
          await this.eventBus.publish(
            new SectionVisibilityChangedEvent(desc.id, true)
          );
        }
      }
    }
  }

  /**
   * Hide sections
   */
  async hide(model: Model, sectionIds: UUID[]): Promise<void> {
    for (const id of sectionIds) {
      const section = model.getSection(id);
      if (section) {
        section.setVisible(false);
        await this.eventBus.publish(
          new SectionVisibilityChangedEvent(id, false)
        );

        // Also hide descendants
        const descendants = model.getDescendants(id);
        for (const desc of descendants) {
          desc.setVisible(false);
          await this.eventBus.publish(
            new SectionVisibilityChangedEvent(desc.id, false)
          );
        }
      }
    }
  }

  /**
   * Toggle section visibility
   */
  async toggle(model: Model, sectionId: UUID): Promise<void> {
    const section = model.getSection(sectionId);
    if (!section) return;

    if (section.visible) {
      await this.hide(model, [sectionId]);
    } else {
      await this.show(model, [sectionId]);
    }
  }

  /**
   * Show all sections
   */
  async showAll(model: Model): Promise<void> {
    const allIds = model.getAllSections().map((s) => s.id);
    await this.show(model, allIds);
  }

  /**
   * Isolate sections (hide all others)
   */
  async isolate(model: Model, sectionIds: UUID[]): Promise<void> {
    const isolatedSet = new Set(sectionIds);
    const allSections = model.getAllSections();

    // Hide all sections not in the isolated set
    for (const section of allSections) {
      const shouldBeVisible = isolatedSet.has(section.id);
      section.setVisible(shouldBeVisible);
      await this.eventBus.publish(
        new SectionVisibilityChangedEvent(section.id, shouldBeVisible)
      );
    }

    // Publish isolation event
    await this.eventBus.publish(new SectionIsolatedEvent(sectionIds));
  }

  /**
   * Check if a section is visible
   */
  isVisible(model: Model, sectionId: UUID): boolean {
    const section = model.getSection(sectionId);
    return section?.visible || false;
  }

  /**
   * Get visible sections
   */
  getVisible(model: Model): UUID[] {
    return model
      .getAllSections()
      .filter((s) => s.visible)
      .map((s) => s.id);
  }
}
