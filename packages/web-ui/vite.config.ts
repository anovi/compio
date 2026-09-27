import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'styles' },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.includes('?'),
    },
  },
  test: { globals: true, environment: 'node', include: ['src/**/*.spec.ts'] },
});
