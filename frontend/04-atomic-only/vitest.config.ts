import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Kept apart from vite.config.ts so the production build never learns about the
// test runner. mergeConfig reuses the aliases/types declared for the build.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
    },
  }),
);
