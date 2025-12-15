import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@presentation/state/store';
import { ThreeRenderer } from '@infrastructure/rendering/ThreeRenderer';
import './ViewerCanvas.css';

/**
 * Main 3D viewer canvas component
 * Follows separation of concerns - handles only rendering
 */
export const ViewerCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<ThreeRenderer | null>(null);

  const currentModel = useAppStore((state) => state.currentModel);
  const selectedIds = useAppStore((state) => state.selectedIds);
  const hoveredId = useAppStore((state) => state.hoveredId);
  const isolatedIds = useAppStore((state) => state.isolatedIds);
  const viewMode = useAppStore((state) => state.viewMode);

  // Initialize renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new ThreeRenderer();
    renderer.initialize(containerRef.current);
    rendererRef.current = renderer;

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        renderer.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  // Load model
  useEffect(() => {
    if (!rendererRef.current) return;

    if (currentModel) {
      rendererRef.current.loadModel(currentModel);
    } else {
      rendererRef.current.unloadModel();
    }
  }, [currentModel]);

  // Update selection
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.selectSections(Array.from(selectedIds));
  }, [selectedIds]);

  // Update hover
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.highlightSection(hoveredId);
  }, [hoveredId]);

  // Update isolation
  useEffect(() => {
    if (!rendererRef.current || !isolatedIds) return;
    rendererRef.current.isolateSections(Array.from(isolatedIds));
  }, [isolatedIds]);

  // Update view mode
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.setViewMode(viewMode);
  }, [viewMode]);

  return (
    <div 
      ref={containerRef} 
      className="viewer-canvas"
      data-testid="viewer-canvas"
    />
  );
};
