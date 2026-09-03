import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        // Every suite here exercises pure modules against the published data. Nothing needs a DOM.
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
