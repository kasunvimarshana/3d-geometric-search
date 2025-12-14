/**
 * Vitest Global Setup
 * Runs before all tests
 */

import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock Three.js for testing
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement('canvas'),
    })),
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      position: { set: vi.fn(), x: 0, y: 0, z: 0 },
      lookAt: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    })),
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
    })),
    OrbitControls: vi.fn().mockImplementation(() => ({
      enabled: true,
      enableDamping: true,
      dampingFactor: 0.05,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      update: vi.fn(),
      dispose: vi.fn(),
    })),
  };
});

// Global test setup
beforeAll(() => {
  // Setup global test environment
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('✅ Test suite complete');
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});

// Global test utilities
global.createMockCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
};

global.createMockFile = (name, type = 'model/gltf+json') => {
  return new File(['mock content'], name, { type });
};

global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
