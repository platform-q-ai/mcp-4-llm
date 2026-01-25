import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      'node_modules/**',
      'bin/**',
      'dist/**',
      '.test-output/**',
      '*.tgz',
      'reports/**',
      'coverage/**',
      // Ignore any generated test projects (from BDD tests)
      '*-test/**',
      'test-*/**',
    ],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off', // Use TypeScript rule instead

      // Import sorting
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Node.js built-ins
            ['^node:'],
            // External packages
            ['^@?\\w'],
            // Internal packages (relative imports)
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // Code quality - all errors, no warnings
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-lines': ['error', 750],
      'max-lines-per-function': ['error', 100],
      'max-params': ['error', 4],

      // No console in templates (they generate code that shouldn't have console)
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  {
    // Allow console and relaxed rules in main generator file (scaffolding tool)
    files: ['create-open-mcp.ts', 'templates/package-json.ts'],
    rules: {
      'no-console': 'off',
      'max-lines-per-function': 'off', // Main function is inherently long
      complexity: 'off', // Generator has many setup steps
    },
  },
  {
    // Relaxed rules for tests
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },
  {
    // Template files that generate bash/other code need relaxed rules
    files: ['templates/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off', // Templates are large by nature
      'no-useless-escape': 'off', // Escapes are for generated code
    },
  },
];
