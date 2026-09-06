import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        // Every suite here exercises pure modules against the published data. Nothing needs a DOM.
        environment: 'node',
        // scripts/ carries the operational tooling; its logic is tested the same way the app's is.
        include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    },
});
