import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // CI runs many test files at once on a slow machine; the placement simulation took over 5 s there (under 1 s here)
    testTimeout: 30_000,
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/unit/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: ['app/**/*.spec.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
