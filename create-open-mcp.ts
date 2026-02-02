#!/usr/bin/env node
/**
 * create-open-mcp - LLM-ready MCP project generator
 *
 * Usage:
 *   npx create-open-mcp <project-name>
 */

import { execSync } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import readline from 'readline';

import { getAgentsMd } from './templates/agents-md.js';
import { getClaudeMd } from './templates/claude-md.js';
import { getCodeQualityScript } from './templates/code-quality-script.js';
import { getCucumberConfig } from './templates/cucumber-config.js';
import { getEslintConfig } from './templates/eslint-config.js';
import { getMiscFiles } from './templates/misc-files.js';
// ============================================
// TEMPLATES - Import from separate files
// ============================================
import { getPackageJson } from './templates/package-json.js';
import { getPrettierConfig } from './templates/prettier-config.js';
import { getSourceFiles } from './templates/source-files.js';
import { getTestFiles } from './templates/test-files.js';
import { getTsConfig, getTsConfigEslint, getTsConfigTest } from './templates/tsconfig.js';
import { getVitestConfig } from './templates/vitest-config.js';

// ============================================
// DIRECTORY STRUCTURE
// ============================================

const directories = [
  'src/domain/entities',
  'src/domain/value-objects',
  'src/domain/errors',
  'src/application/use-cases',
  'src/application/ports',
  'src/application/schemas',
  'src/infrastructure',
  'src/mcp/tools',
  'src/di',
  'tests/unit/domain/entities',
  'tests/unit/domain/value-objects',
  'tests/unit/application/use-cases',
  'tests/step-definitions',
  'tests/mocks',
  'features',
  'scripts',
  'reports',
  '.husky',
];

// ============================================
// PROMPTS
// ============================================

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   create-open-mcp                                            ║
║   LLM-ready MCP project generator                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

  // Parse CLI args
  let name = process.argv[2];
  let description: string | undefined;

  // Parse --description flag
  const descIndex = process.argv.indexOf('--description');
  if (descIndex !== -1 && process.argv[descIndex + 1]) {
    description = process.argv[descIndex + 1];
  }

  if (!name || name.startsWith('-')) {
    name = await prompt('Project name: ');
  }

  // Use provided description or auto-generate from project name
  if (!description) {
    description = `${name} MCP server`;
  }

  // Validate name
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    console.error(
      'Error: Project name must start with a letter and contain only lowercase letters, numbers, and hyphens'
    );
    process.exit(1);
  }

  // Support TEST_OUTPUT_DIR for testing
  const baseDir = process.env.TEST_OUTPUT_DIR || process.cwd();
  const projectPath = path.resolve(baseDir, name);

  console.log(`\n📁 Creating ${name} at ${projectPath}...\n`);

  // 1. Create directories
  console.log('📂 Creating directory structure...');
  for (const dir of directories) {
    await mkdir(path.join(projectPath, dir), { recursive: true });
  }

  // 2. Fetch package versions and collect all files
  const miscFiles = getMiscFiles();
  const packageJson = await getPackageJson(name, description);

  const files: Record<string, string> = {
    // Config files
    'package.json': packageJson,
    'tsconfig.json': getTsConfig(),
    'tsconfig.eslint.json': getTsConfigEslint(),
    'tsconfig.test.json': getTsConfigTest(),
    'eslint.config.js': getEslintConfig(),
    'vitest.config.ts': getVitestConfig(),
    'cucumber.cjs': getCucumberConfig(),
    '.prettierrc': getPrettierConfig(),

    // Documentation
    'CLAUDE.md': getClaudeMd(name),
    'AGENTS.md': getAgentsMd(name),
    'CONVENTIONS.md': miscFiles.conventions,
    'TROUBLESHOOTING.md': miscFiles.troubleshooting,

    // Scripts and hooks
    'scripts/check-code-quality.sh': getCodeQualityScript(),
    '.husky/pre-commit': '#!/bin/sh\nnpm run pre-commit\n',

    // Misc
    '.gitignore': miscFiles.gitignore,
    '.env.example': miscFiles.envExample,

    // Source files
    ...getSourceFiles(name),

    // Test files
    ...getTestFiles(),

    // Example feature
    'features/example.feature': miscFiles.exampleFeature,
  };

  // 3. Write all files
  console.log('\n📝 Writing files...');
  let fileCount = 0;
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(projectPath, filePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content);
    fileCount++;
  }
  console.log(`   ✅ Created ${fileCount} files`);

  // 4. Make scripts executable
  console.log('\n🔧 Making scripts executable...');
  execSync(`chmod +x "${path.join(projectPath, 'scripts/check-code-quality.sh')}"`);
  execSync(`chmod +x "${path.join(projectPath, '.husky/pre-commit')}"`);

  // 5. Initialize git
  console.log('📦 Initializing git...');
  execSync('git init', { cwd: projectPath, stdio: 'pipe' });

  // 6. Install dependencies
  console.log('📦 Installing dependencies (this may take a minute)...');
  try {
    execSync('npm install', { cwd: projectPath, stdio: 'pipe' });
    console.log('   ✅ Dependencies installed');
  } catch {
    console.error('   ⚠️  npm install failed, you may need to run it manually');
  }

  // 7. Setup husky
  console.log('🐕 Setting up husky...');
  try {
    execSync('npx husky', { cwd: projectPath, stdio: 'pipe' });
  } catch {
    // Husky might already be set up
  }

  // 8. Run lint:fix and format to ensure all files are clean
  console.log('🧹 Formatting and fixing lint issues...');
  try {
    execSync('npm run lint:fix', { cwd: projectPath, stdio: 'pipe' });
    execSync('npm run format', { cwd: projectPath, stdio: 'pipe' });
  } catch {
    // May fail if there are unfixable issues, continue anyway
  }

  // 9. Initial commit
  console.log('📝 Creating initial commit...');
  try {
    execSync('git add .', { cwd: projectPath, stdio: 'pipe' });
    execSync('git commit -m "Initial scaffold from create-open-mcp"', {
      cwd: projectPath,
      stdio: 'pipe',
    });
    console.log('   ✅ Initial commit created');
  } catch {
    console.error('   ⚠️  Git commit failed, you may need to commit manually');
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ✅ Successfully created ${name.padEnd(36)}║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Next steps:                                                 ║
║                                                              ║
║    cd ${name.padEnd(53)}║
║    npm run dev                                               ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Available commands:                                         ║
║                                                              ║
║    npm run dev           Start development server            ║
║    npm run build         Build for production                ║
║    npm run test          Run all tests                       ║
║    npm run test:coverage Run tests with coverage             ║
║    npm run lint          Check for issues                    ║
║    npm run lint:fix      Auto-fix issues                     ║
║    npm run pre-commit    Run full quality gate               ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📖 Read CLAUDE.md and AGENTS.md for development guide       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
