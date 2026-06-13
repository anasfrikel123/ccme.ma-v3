import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror tsconfig.json paths so test imports like `~/lib/tax-maroc`
      // and `~/data/cabinet` resolve identically to the Astro build.
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    // Tax math is fast; no need to bother with thread/fork pool tuning.
    reporters: ['default'],
  },
});
