export function getEslintConfig(): string {
  return `import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import boundaries from 'eslint-plugin-boundaries';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  eslint.configs.recommended,
  
  // ============================================
  // SOURCE FILES
  // ============================================
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        crypto: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      boundaries: boundaries,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      'boundaries/elements': [
        // Each layer includes all files within that folder
        { type: 'domain', pattern: 'src/domain/**' },
        { type: 'application', pattern: 'src/application/**' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**' },
        { type: 'mcp', pattern: 'src/mcp/**' },
        { type: 'di', pattern: 'src/di/**' },
        // Entry point is specifically src/index.ts only
        { type: 'entry', pattern: 'src/index.ts', mode: 'file' },
      ],
      'boundaries/dependency-nodes': ['import'],
      'boundaries/include': ['src/**/*.ts'],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...boundaries.configs.strict.rules,

      // === TYPESCRIPT RULES ===
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',

      // === CLEAN ARCHITECTURE BOUNDARIES ===
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '\${file.type} is not allowed to import \${dependency.type}',
          rules: [
            // Domain: Pure business logic, no external dependencies
            { from: ['domain'], allow: ['domain'] },
            
            // Application: Use cases, can use domain
            { from: ['application'], allow: ['application', 'domain'] },
            
            // Infrastructure: Adapters, can use application and domain
            { from: ['infrastructure'], allow: ['infrastructure', 'application', 'domain'] },
            
            // MCP: Presentation layer, uses application via DI
            { from: ['mcp'], allow: ['mcp', 'application', 'di'] },
            
            // DI: Wiring layer, can access everything except domain directly
            { from: ['di'], allow: ['di', 'application', 'infrastructure', 'mcp'] },
            
            // Entry: Bootstrap, only touches DI and MCP
            { from: ['entry'], allow: ['mcp', 'di'] },
          ],
        },
      ],

      // === ENTRY POINT ENFORCEMENT ===
      // Enforce barrel exports for domain and application layers
      // DI, MCP, and Infrastructure are allowed direct imports
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          message: 'Import from index.ts barrel file instead of internal files',
          rules: [
            // Domain and application must be imported via barrel (index.ts)
            { target: ['domain'], allow: 'index.ts' },
            { target: ['application'], allow: 'index.ts' },
            // Infrastructure, MCP, DI allow direct imports
            { target: ['infrastructure'], allow: '*' },
            { target: ['mcp'], allow: '*' },
            { target: ['di'], allow: '*' },
            { target: ['entry'], allow: '*' },
          ],
        },
      ],

      // === EXTERNAL PACKAGE RESTRICTIONS ===
      'boundaries/external': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['domain'],
              disallow: ['*'],
              allow: [],
              message: 'Domain layer must have no external dependencies (pure TypeScript only)',
            },
            {
              from: ['application'],
              disallow: [
                'express',
                'fastify',
                'koa',
                'better-sqlite3',
                'pg',
                'mysql2',
                'neo4j-driver',
                'mongodb',
                '@modelcontextprotocol/*',
              ],
              message: 'Application layer cannot depend on infrastructure packages',
            },
          ],
        },
      ],

      // === CATCH MISPLACED FILES ===
      // Note: boundaries/no-unknown disabled as it can cause issues with simple patterns
      // 'boundaries/no-unknown': ['error'],
      'boundaries/no-private': ['error', { allowUncles: false }],

      // === IMPORT ORDERING ===
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports (must be first)
            ['^reflect-metadata'],
            // Node.js builtins
            ['^node:'],
            // External packages
            ['^@?\\\\w'],
            // Internal - domain layer
            ['^@/domain'],
            // Internal - application layer
            ['^@/application'],
            // Internal - infrastructure layer
            ['^@/infrastructure'],
            // Internal - mcp layer
            ['^@/mcp'],
            // Internal - di layer
            ['^@/di'],
            // Relative imports
            ['^\\\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // === CODE QUALITY - all errors, no warnings ===
      'no-console': ['error', { allow: ['warn', 'error'] }],
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-lines': ['error', { max: 750, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
    },
  },

  // ============================================
  // TEST FILES (more permissive)
  // ============================================
  {
    files: ['tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.test.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'max-lines': ['warn', { max: 1000, skipBlankLines: true, skipComments: true }],
      'simple-import-sort/imports': 'error',
    },
  },

  // ============================================
  // IGNORED PATHS
  // ============================================
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'reports/**'],
  },
];
`;
}
