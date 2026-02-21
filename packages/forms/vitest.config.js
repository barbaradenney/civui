import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.ts'],
        globals: true,
    },
});
//# sourceMappingURL=vitest.config.js.map