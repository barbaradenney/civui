import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    root: here,
    include: ['__tests__/**/*.test.ts'],
    environment: 'node',
  },
});
