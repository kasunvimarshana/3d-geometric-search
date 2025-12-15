import React, { useState, useCallback } from 'react';
import { useAppStore } from '@presentation/state/store';
import { LoadModelUseCase } from '@core/use-cases/LoadModelUseCase';
import { EventBus } from '@domain/events/DomainEvents';
import { ModelFormat, LoadingState } from '@shared/types/enums';
import { GLTFModelLoader } from '@infrastructure/loaders/GLTFModelLoader';
import { OBJModelLoader } from '@infrastructure/loaders/OBJModelLoader';
import { STLModelLoader } from '@infrastructure/loaders/STLModelLoader';
import { STEPModelLoader } from '@infrastructure/loaders/STEPModelLoader';
import './FileLoader.css';

/**
 * File loader component
 * Follows Single Responsibility Principle
 */
export const FileLoader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const setModel = useAppStore((state) => state.setModel);
  const setLoadingState = useAppStore((state) => state.setLoadingState);
  const setLoadingProgress = useAppStore((state) => state.setLoadingProgress);
  const setError = useAppStore((state) => state.setError);

  // Initialize loaders
  const loadersMap = new Map([
    [ModelFormat.GLTF, new GLTFModelLoader()],
    [ModelFormat.GLB, new GLTFModelLoader()],
    [ModelFormat.OBJ, new OBJModelLoader()],
    [ModelFormat.STL, new STLModelLoader()],
    [ModelFormat.STEP, new STEPModelLoader()],
  ]);

  const eventBus = new EventBus();
  const loadModelUseCase = new LoadModelUseCase(loadersMap, eventBus);

  const handleFileLoad = useCallback(
    async (file: File) => {
      setLoadingState(LoadingState.LOADING);
      setError(null);

      const result = await loadModelUseCase.execute(file, (progress) => {
        setLoadingProgress({
          loaded: progress,
          total: 100,
          percentage: progress,
          message: 'Loading model...',
        });
      });

      if (result.error) {
        setError(result.error);
        setLoadingState(LoadingState.ERROR);
      } else {
        setModel(result.model);
        setLoadingState(LoadingState.SUCCESS);
      }

      setLoadingProgress(null);
    },
    [loadModelUseCase, setModel, setLoadingState, setLoadingProgress, setError]
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileLoad(file);
      }
    },
    [handleFileLoad]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileLoad(file);
      }
    },
    [handleFileLoad]
  );

  return (
    <div
      className={`file-loader ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-input"
        className="file-input"
        accept=".gltf,.glb,.obj,.stl,.step,.stp"
        onChange={handleFileInput}
      />
      <label htmlFor="file-input" className="file-loader-label">
        <div className="file-loader-icon">📁</div>
        <div className="file-loader-text">
          <strong>Drop a 3D file here</strong>
          <span>or click to browse</span>
        </div>
        <div className="file-loader-formats">
          Supports: glTF, GLB, OBJ, STL, STEP
        </div>
      </label>
    </div>
  );
};
