// Package lists - versions will be fetched at runtime
export const dependencies = [
  '@modelcontextprotocol/sdk',
  'dotenv',
  'reflect-metadata',
  'tsyringe',
  'zod',
];

export const devDependencies = [
  '@cucumber/cucumber',
  '@eslint/js',
  '@types/chai',
  '@types/node',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  '@vitest/coverage-v8',
  'chai',
  'eslint',
  'eslint-import-resolver-typescript',
  'eslint-plugin-boundaries',
  'eslint-plugin-simple-import-sort',
  'husky',
  'lint-staged',
  'prettier',
  'tsc-alias',
  'tsx',
  'typescript',
  'vitest',
];

/**
 * Fetch the latest version of a package from npm registry
 */
async function getLatestVersion(pkg: string): Promise<string> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${pkg}/latest`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${pkg}: ${response.status}`);
    }
    const data = (await response.json()) as { version: string };
    return `^${data.version}`;
  } catch {
    console.error(`  ⚠️  Could not fetch latest version for ${pkg}, using fallback`);
    return getFallbackVersion(pkg);
  }
}

/**
 * Fallback versions in case npm registry is unavailable
 */
function getFallbackVersion(pkg: string): string {
  const fallbacks: Record<string, string> = {
    '@modelcontextprotocol/sdk': '^1.25.2',
    dotenv: '^17.2.3',
    'reflect-metadata': '^0.2.2',
    tsyringe: '^4.10.0',
    zod: '^4.3.5',
    '@cucumber/cucumber': '^12.5.0',
    '@eslint/js': '^9.27.0',
    '@types/chai': '^5.2.3',
    '@types/node': '^22.0.0',
    '@typescript-eslint/eslint-plugin': '^8.32.0',
    '@typescript-eslint/parser': '^8.32.0',
    '@vitest/coverage-v8': '^4.0.17',
    chai: '^6.2.2',
    eslint: '^9.27.0',
    'eslint-import-resolver-typescript': '^4.4.4',
    'eslint-plugin-boundaries': '^5.0.1',
    'eslint-plugin-simple-import-sort': '^12.1.0',
    husky: '^9.1.7',
    'lint-staged': '^16.2.7',
    prettier: '^3.5.3',
    'tsc-alias': '^1.8.16',
    tsx: '^4.19.4',
    typescript: '^5.9.3',
    vitest: '^4.0.17',
  };
  return fallbacks[pkg] || '^1.0.0';
}

/**
 * Fetch all package versions in parallel
 */
async function fetchVersions(packages: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  // Fetch in parallel with concurrency limit
  const batchSize = 5;
  for (let i = 0; i < packages.length; i += batchSize) {
    const batch = packages.slice(i, i + batchSize);
    const versions = await Promise.all(batch.map(getLatestVersion));
    batch.forEach((pkg, index) => {
      results[pkg] = versions[index];
    });
  }

  return results;
}

/**
 * Generate package.json with latest versions
 */
export async function getPackageJson(name: string, description: string): Promise<string> {
  console.log('   📡 Fetching latest package versions from npm...');

  const [deps, devDeps] = await Promise.all([
    fetchVersions(dependencies),
    fetchVersions(devDependencies),
  ]);

  const pkg = {
    name,
    version: '0.1.0',
    description,
    type: 'module',
    main: 'dist/index.js',
    bin: {
      [name]: './dist/index.js',
    },
    scripts: {
      build: 'tsc && tsc-alias',
      dev: 'tsx watch src/index.ts',
      start: 'node dist/index.js',
      typecheck: 'tsc --noEmit',
      lint: 'eslint src tests',
      'lint:fix': 'eslint src tests --fix',
      format: 'prettier --write "src/**/*.ts" "tests/**/*.ts"',
      'format:check': 'prettier --check "src/**/*.ts" "tests/**/*.ts"',
      test: 'npm run test:unit && npm run test:features',
      'test:unit': 'vitest run',
      'test:unit:watch': 'vitest',
      'test:features': 'cucumber-js',
      'test:coverage': 'vitest run --coverage',
      'check:code-quality': 'bash scripts/check-code-quality.sh',
      'pre-commit':
        'npm run check:code-quality && npm run lint && npm run format:check && npm run typecheck && npm run build && npm run test',
      prepare: 'husky',
    },
    keywords: ['mcp', 'model-context-protocol', 'llm', 'ai'],
    author: '',
    license: 'MIT',
    dependencies: deps,
    devDependencies: devDeps,
    'lint-staged': {
      '*.ts': ['eslint --fix', 'prettier --write'],
    },
  };

  return JSON.stringify(pkg, null, 2);
}
