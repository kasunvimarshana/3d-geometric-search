import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/', '**/*.config.js', '**/index.js'],
    },
    include: ['tests/**/*.{test,spec}.js'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@application': path.resolve(__dirname, './src/application'),
      '@state': path.resolve(__dirname, './src/application/state'),
      '@controllers': path.resolve(__dirname, './src/controllers'),
    },
  },
});
