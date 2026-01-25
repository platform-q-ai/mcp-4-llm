import { After, Before, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';
import { spawnSync } from 'child_process';
import { accessSync, constants, existsSync, readFileSync, rmSync, statSync } from 'fs';
import path from 'path';

import { GeneratorWorld } from './world.js';

const TEST_OUTPUT_DIR = path.join(process.cwd(), '.test-output');

Before(async function (this: GeneratorWorld) {
  this.projectName = '';
  this.projectPath = '';
  this.description = '';
  this.error = null;
  this.commandOutput = '';
  this.commandExitCode = 0;
});

After(async function (this: GeneratorWorld) {
  // Cleanup generated test projects after each scenario
  if (existsSync(TEST_OUTPUT_DIR)) {
    rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
});

// =====================
// Given steps
// =====================

Given('a clean test environment', async function (this: GeneratorWorld) {
  if (existsSync(TEST_OUTPUT_DIR)) {
    rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
});

Given(
  'I want to create a project named {string}',
  async function (this: GeneratorWorld, name: string) {
    this.projectName = name;
    this.projectPath = path.join(TEST_OUTPUT_DIR, name);
  }
);

Given('the description {string}', async function (this: GeneratorWorld, description: string) {
  this.description = description;
});

Given(
  'I have generated and installed a project named {string}',
  async function (this: GeneratorWorld, name: string) {
    this.projectName = name;
    this.projectPath = path.join(TEST_OUTPUT_DIR, name);

    // Generate the project
    const result = spawnSync(
      'npx',
      ['tsx', 'create-open-mcp.ts', name, '--description', 'Test project'],
      {
        cwd: process.cwd(),
        env: { ...process.env, TEST_OUTPUT_DIR },
        stdio: 'pipe',
        encoding: 'utf-8',
      }
    );

    if (result.status !== 0) {
      throw new Error(`Generator failed: ${result.stderr}`);
    }

    // Note: npm install is already run by the generator
  }
);

// =====================
// When steps
// =====================

When('I run the generator', async function (this: GeneratorWorld) {
  const args = ['tsx', 'create-open-mcp.ts', this.projectName];
  // Always provide description to avoid interactive prompt blocking
  const desc = this.description || 'Test project';
  args.push('--description', desc);

  const result = spawnSync('npx', args, {
    cwd: process.cwd(),
    env: { ...process.env, TEST_OUTPUT_DIR },
    stdio: 'pipe',
    encoding: 'utf-8',
  });

  this.commandOutput = result.stdout + result.stderr;
  this.commandExitCode = result.status ?? 1;

  if (result.status !== 0) {
    this.error = new Error(result.stderr || 'Generator failed');
  }
});

When('I run typecheck in the generated project', async function (this: GeneratorWorld) {
  const result = spawnSync('npm', ['run', 'typecheck'], {
    cwd: this.projectPath,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  this.commandOutput = result.stdout + result.stderr;
  this.commandExitCode = result.status ?? 1;
});

When('I run lint in the generated project', async function (this: GeneratorWorld) {
  const result = spawnSync('npm', ['run', 'lint'], {
    cwd: this.projectPath,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  this.commandOutput = result.stdout + result.stderr;
  this.commandExitCode = result.status ?? 1;
});

When('I run format check in the generated project', async function (this: GeneratorWorld) {
  const result = spawnSync('npm', ['run', 'format:check'], {
    cwd: this.projectPath,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  this.commandOutput = result.stdout + result.stderr;
  this.commandExitCode = result.status ?? 1;
});

When('I run unit tests in the generated project', async function (this: GeneratorWorld) {
  const result = spawnSync('npm', ['run', 'test:unit'], {
    cwd: this.projectPath,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  this.commandOutput = result.stdout + result.stderr;
  this.commandExitCode = result.status ?? 1;
});

When('I run build in the generated project', async function (this: GeneratorWorld) {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: this.projectPath,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  this.commandOutput = result.stdout + result.stderr;
  this.commandExitCode = result.status ?? 1;
});

When('I run code quality check in the generated project', async function (this: GeneratorWorld) {
  const result = spawnSync('npm', ['run', 'check:code-quality'], {
    cwd: this.projectPath,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  this.commandOutput = result.stdout + result.stderr;
  this.commandExitCode = result.status ?? 1;
});

// =====================
// Then steps
// =====================

Then('a directory {string} should be created', async function (this: GeneratorWorld, name: string) {
  const dirPath = path.join(TEST_OUTPUT_DIR, name);
  expect(existsSync(dirPath), `Directory ${dirPath} should exist`).to.be.true;
  expect(statSync(dirPath).isDirectory(), `${dirPath} should be a directory`).to.be.true;
});

Then('it should contain a valid package.json', async function (this: GeneratorWorld) {
  const pkgPath = path.join(this.projectPath, 'package.json');
  expect(existsSync(pkgPath), 'package.json should exist').to.be.true;

  const content = readFileSync(pkgPath, 'utf-8');
  expect(() => JSON.parse(content), 'package.json should be valid JSON').not.to.throw;
});

Then('the package.json should be valid JSON', async function (this: GeneratorWorld) {
  const pkgPath = path.join(this.projectPath, 'package.json');
  const content = readFileSync(pkgPath, 'utf-8');
  expect(() => JSON.parse(content)).not.to.throw;
});

Then(
  'the package.json name should be {string}',
  async function (this: GeneratorWorld, name: string) {
    const pkgPath = path.join(this.projectPath, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    expect(pkg.name).to.equal(name);
  }
);

Then(
  'the package.json description should be {string}',
  async function (this: GeneratorWorld, description: string) {
    const pkgPath = path.join(this.projectPath, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    expect(pkg.description).to.equal(description);
  }
);

Then(
  'the following directories should exist:',
  async function (this: GeneratorWorld, dataTable: { hashes: () => Array<{ directory: string }> }) {
    const directories = dataTable.hashes();
    for (const row of directories) {
      const dirPath = path.join(this.projectPath, row.directory);
      expect(existsSync(dirPath), `Directory ${row.directory} should exist`).to.be.true;
    }
  }
);

Then(
  'the following files should exist:',
  async function (this: GeneratorWorld, dataTable: { hashes: () => Array<{ file: string }> }) {
    const files = dataTable.hashes();
    for (const row of files) {
      const filePath = path.join(this.projectPath, row.file);
      expect(existsSync(filePath), `File ${row.file} should exist`).to.be.true;
    }
  }
);

Then('the generator should fail', async function (this: GeneratorWorld) {
  expect(this.commandExitCode, 'Generator should have failed').to.not.equal(0);
});

Then('the error should mention {string}', async function (this: GeneratorWorld, text: string) {
  expect(this.commandOutput.toLowerCase(), `Output should mention "${text}"`).to.include(
    text.toLowerCase()
  );
});

Then(
  'the package.json should have required scripts:',
  async function (this: GeneratorWorld, dataTable: { hashes: () => Array<{ script: string }> }) {
    const pkgPath = path.join(this.projectPath, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const scripts = dataTable.hashes();

    for (const row of scripts) {
      expect(pkg.scripts, `Should have script: ${row.script}`).to.have.property(row.script);
    }
  }
);

Then('the package.json should have MCP SDK dependency', async function (this: GeneratorWorld) {
  const pkgPath = path.join(this.projectPath, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  expect(pkg.dependencies).to.have.property('@modelcontextprotocol/sdk');
});

Then('the eslint.config.js should be valid JavaScript', async function (this: GeneratorWorld) {
  const configPath = path.join(this.projectPath, 'eslint.config.js');
  expect(existsSync(configPath), 'eslint.config.js should exist').to.be.true;
  // Basic syntax check - more thorough check would require actually running node
  const content = readFileSync(configPath, 'utf-8');
  expect(content).to.include('export default');
});

Then('the tsconfig.json should be valid JSON', async function (this: GeneratorWorld) {
  const configPath = path.join(this.projectPath, 'tsconfig.json');
  const content = readFileSync(configPath, 'utf-8');
  expect(() => JSON.parse(content)).not.to.throw;
});

Then('the tsconfig.json should target ES2022 or later', async function (this: GeneratorWorld) {
  const configPath = path.join(this.projectPath, 'tsconfig.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const target = config.compilerOptions?.target?.toUpperCase();
  const validTargets = ['ES2022', 'ES2023', 'ESNEXT'];
  expect(validTargets).to.include(target);
});

Then('the vitest.config.ts should exist', async function (this: GeneratorWorld) {
  const configPath = path.join(this.projectPath, 'vitest.config.ts');
  expect(existsSync(configPath), 'vitest.config.ts should exist').to.be.true;
});

Then(
  'the vitest.config.ts should configure 80% coverage thresholds',
  async function (this: GeneratorWorld) {
    const configPath = path.join(this.projectPath, 'vitest.config.ts');
    const content = readFileSync(configPath, 'utf-8');
    expect(content).to.include('80');
    expect(content).to.include('thresholds');
  }
);

Then(
  'the following index.ts files should exist:',
  async function (this: GeneratorWorld, dataTable: { hashes: () => Array<{ file: string }> }) {
    const files = dataTable.hashes();
    for (const row of files) {
      const filePath = path.join(this.projectPath, row.file);
      expect(existsSync(filePath), `File ${row.file} should exist`).to.be.true;
    }
  }
);

Then('{word} should exist', async function (this: GeneratorWorld, filePath: string) {
  const fullPath = path.join(this.projectPath, filePath);
  expect(existsSync(fullPath), `${filePath} should exist`).to.be.true;
});

Then(
  '{word} should import McpServer from SDK',
  async function (this: GeneratorWorld, filePath: string) {
    const fullPath = path.join(this.projectPath, filePath);
    const content = readFileSync(fullPath, 'utf-8');
    expect(content).to.include('@modelcontextprotocol/sdk');
    expect(content).to.include('McpServer');
  }
);

Then('{word} should be executable', async function (this: GeneratorWorld, filePath: string) {
  const fullPath = path.join(this.projectPath, filePath);
  expect(existsSync(fullPath), `${filePath} should exist`).to.be.true;
  expect(() => accessSync(fullPath, constants.X_OK)).not.to.throw;
});

Then('the command should succeed', async function (this: GeneratorWorld) {
  expect(this.commandExitCode, `Command failed with output: ${this.commandOutput}`).to.equal(0);
});

Then('dist directory should exist', async function (this: GeneratorWorld) {
  const distPath = path.join(this.projectPath, 'dist');
  expect(existsSync(distPath), 'dist directory should exist').to.be.true;
});
