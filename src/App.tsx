import React from 'react';
import { useAppStore, selectHasModel } from '@presentation/state/store';
import { Toolbar } from '@presentation/components/Toolbar';
import { ViewerCanvas } from '@presentation/components/ViewerCanvas';
import { SectionTree } from '@presentation/components/SectionTree';
import { FileLoader } from '@presentation/components/FileLoader';
import './App.css';

/**
 * Main application component
 * Follows clean architecture - orchestrates UI components
 */
function App() {
  const hasModel = useAppStore(selectHasModel);
  const currentModel = useAppStore((state) => state.currentModel);
  const error = useAppStore((state) => state.error);

  const rootSections = currentModel
    ? currentModel.getSectionsByParentId(undefined)
    : [];

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">3D Geometric Search</h1>
        <p className="app-subtitle">
          Modern reactive 3D viewer for industry-standard formats
        </p>
      </header>

      {error && (
        <div className="app-error">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {hasModel ? (
        <div className="app-content">
          <Toolbar />
          <div className="app-workspace">
            <aside className="app-sidebar">
              <div className="sidebar-header">
                <h2>Sections</h2>
              </div>
              <div className="sidebar-content">
                <SectionTree sections={rootSections} />
              </div>
            </aside>
            <main className="app-viewer">
              <ViewerCanvas />
            </main>
          </div>
        </div>
      ) : (
        <div className="app-loader">
          <FileLoader />
        </div>
      )}

      <footer className="app-footer">
        <span>Built with React, Three.js, and Clean Architecture</span>
      </footer>
    </div>
  );
}

export default App;
