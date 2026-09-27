import fs from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

import { parseCurrenciesCsv } from './src/units/parse-currencies-csv';

const currencies = parseCurrenciesCsv(
  fs.readFileSync(join(import.meta.dirname, 'src/units/currencies-list.csv'), 'utf8'),
);

export default defineConfig({
  define: { __CURRENCIES__: JSON.stringify(currencies) },
  build: {
    emptyOutDir: false,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.includes('?'),
    },
  },
  test: { globals: true, environment: 'node', include: ['src/**/*.spec.ts'] },
});
