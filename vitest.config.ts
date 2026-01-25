import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Only measure coverage on template files that have testable logic
      // Template files that are mostly string literals (agents-md, misc-files, etc.)
      // are better tested via BDD tests that verify the generated output
      // package-json.ts is excluded because its error handling (network failures)
      // requires mocking fetch which adds complexity for edge cases
      include: [
        'templates/eslint-config.ts',
        'templates/vitest-config.ts',
        'templates/code-quality-script.ts',
        'templates/source-files.ts',
      ],
      exclude: ['node_modules', 'bin', 'tests', '**/*.d.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    testTimeout: 120000, // 2 minutes for integration tests
  },
});
