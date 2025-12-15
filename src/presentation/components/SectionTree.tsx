import React, { useCallback } from 'react';
import { useAppStore } from '@presentation/state/store';
import { Section } from '@core/entities/Section';
import './SectionTree.css';

interface SectionTreeProps {
  sections: Section[];
  level?: number;
}

/**
 * Hierarchical section tree component
 * Follows Single Responsibility Principle
 */
export const SectionTree: React.FC<SectionTreeProps> = ({
  sections,
  level = 0,
}) => {
  const currentModel = useAppStore((state) => state.currentModel);
  const selectedIds = useAppStore((state) => state.selectedIds);
  const selectSections = useAppStore((state) => state.selectSections);
  const setHoveredId = useAppStore((state) => state.setHoveredId);

  const handleSectionClick = useCallback(
    (sectionId: string, event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        // Multi-select
        selectSections([sectionId], false);
      } else {
        // Single select
        selectSections([sectionId], true);
      }
    },
    [selectSections]
  );

  const handleSectionHover = useCallback(
    (sectionId: string | null) => {
      setHoveredId(sectionId);
    },
    [setHoveredId]
  );

  return (
    <ul className="section-tree" style={{ paddingLeft: level * 20 }}>
      {sections.map((section) => {
        const isSelected = selectedIds.has(section.id);
        const children = currentModel?.getSectionsByParentId(section.id) || [];

        return (
          <li key={section.id} className="section-tree-item">
            <div
              className={`section-node ${isSelected ? 'selected' : ''}`}
              onClick={(e) => handleSectionClick(section.id, e)}
              onMouseEnter={() => handleSectionHover(section.id)}
              onMouseLeave={() => handleSectionHover(null)}
            >
              <span className="section-icon">
                {children.length > 0 ? '📁' : '📄'}
              </span>
              <span className="section-name">{section.name}</span>
              {section.metadata?.partNumber && (
                <span className="section-part-number">
                  {section.metadata.partNumber}
                </span>
              )}
            </div>
            {children.length > 0 && (
              <SectionTree sections={children} level={level + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
};
