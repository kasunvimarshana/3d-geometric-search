import React from 'react';
import { useAppStore } from '@presentation/state/store';
import { ViewMode } from '@shared/types/enums';
import './Toolbar.css';

/**
 * Main toolbar component
 * Follows Single Responsibility Principle
 */
export const Toolbar: React.FC = () => {
  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);
  const toggleGrid = useAppStore((state) => state.toggleGrid);
  const toggleAxes = useAppStore((state) => state.toggleAxes);
  const resetViewer = useAppStore((state) => state.resetViewer);
  const clearSelection = useAppStore((state) => state.clearSelection);
  const clearIsolation = useAppStore((state) => state.clearIsolation);

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={() => resetViewer()}
          title="Reset View"
        >
          🔄 Reset
        </button>
        <button
          className="toolbar-button"
          onClick={() => clearSelection()}
          title="Clear Selection"
        >
          ❌ Clear
        </button>
        <button
          className="toolbar-button"
          onClick={() => clearIsolation()}
          title="Show All"
        >
          👁 Show All
        </button>
      </div>

      <div className="toolbar-section">
        <select
          className="toolbar-select"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as ViewMode)}
        >
          <option value={ViewMode.SHADED}>Shaded</option>
          <option value={ViewMode.WIREFRAME}>Wireframe</option>
          <option value={ViewMode.TRANSPARENT}>Transparent</option>
        </select>
      </div>

      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={() => toggleGrid()}
          title="Toggle Grid"
        >
          📐 Grid
        </button>
        <button
          className="toolbar-button"
          onClick={() => toggleAxes()}
          title="Toggle Axes"
        >
          ⚡ Axes
        </button>
      </div>
    </div>
  );
};
