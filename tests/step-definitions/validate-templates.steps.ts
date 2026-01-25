import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { getAgentsMd } from '../../templates/agents-md.js';
import { getClaudeMd } from '../../templates/claude-md.js';
import { getEslintConfig } from '../../templates/eslint-config.js';
import { getPackageJson } from '../../templates/package-json.js';
import { getSourceFiles } from '../../templates/source-files.js';
import { getVitestConfig } from '../../templates/vitest-config.js';
import { GeneratorWorld } from './world.js';

let packageJsonOutput = '';
let eslintConfigOutput = '';
let vitestConfigOutput = '';
let sourceFilesOutput: Record<string, string> = {};
let agentsMdOutput = '';
let claudeMdOutput = '';

// ============================================
// Given steps
// ============================================

Given(
  'the package.json template is loaded with name {string} and description {string}',
  async function (this: GeneratorWorld, name: string, description: string) {
    packageJsonOutput = await getPackageJson(name, description);
  }
);

// Note: 'the vitest config template is loaded' step is defined in coverage-thresholds.steps.ts
// We use a different step name here to avoid ambiguity
Given('the vitest config template is loaded for validation', function (this: GeneratorWorld) {
  vitestConfigOutput = getVitestConfig();
});

// Note: eslint config template is loaded in eslint-errors-only.steps.ts
// This step is reused here for validate-templates feature
Given('the eslint config template is loaded for validation', function (this: GeneratorWorld) {
  eslintConfigOutput = getEslintConfig();
});

Given(
  'the source files template is loaded with name {string}',
  function (this: GeneratorWorld, name: string) {
    sourceFilesOutput = getSourceFiles(name);
  }
);

Given(
  'the documentation templates are loaded with name {string}',
  function (this: GeneratorWorld, name: string) {
    agentsMdOutput = getAgentsMd(name);
    claudeMdOutput = getClaudeMd(name);
  }
);

// ============================================
// package.json validation steps
// ============================================

Then('the package.json output should be valid JSON', function () {
  expect(() => JSON.parse(packageJsonOutput)).not.to.throw();
});

Then('the package.json output should have script {string}', function (script: string) {
  const pkg = JSON.parse(packageJsonOutput);
  expect(pkg.scripts).to.have.property(script);
});

Then('the package.json output should have MCP SDK dependency', function () {
  const pkg = JSON.parse(packageJsonOutput);
  expect(pkg.dependencies).to.have.property('@modelcontextprotocol/sdk');
});

// ============================================
// ESLint config validation steps
// ============================================

Then('the eslint config should contain {string}', function (text: string) {
  expect(eslintConfigOutput).to.include(text);
});

Then('the eslint config should configure boundaries plugin', function () {
  expect(eslintConfigOutput).to.include('boundaries');
});

// ============================================
// Vitest config validation steps
// ============================================

Then('the vitest config should have 80% coverage thresholds', function () {
  expect(vitestConfigOutput).to.include('80');
  expect(vitestConfigOutput).to.include('thresholds');
});

// ============================================
// Source files validation steps
// ============================================

Then('the source files should include domain index.ts', function () {
  expect(sourceFilesOutput).to.have.property('src/domain/index.ts');
});

Then('the source files should include application index.ts', function () {
  expect(sourceFilesOutput).to.have.property('src/application/index.ts');
});

Then('the source files should include infrastructure index.ts', function () {
  expect(sourceFilesOutput).to.have.property('src/infrastructure/index.ts');
});

Then('the server.ts should import McpServer from SDK', function () {
  const serverContent = sourceFilesOutput['src/mcp/server.ts'];
  expect(serverContent).to.include('@modelcontextprotocol/sdk');
  expect(serverContent).to.include('McpServer');
});

// ============================================
// Documentation templates validation
// ============================================

Then('CLAUDE.md and agents.md should have identical content', function () {
  expect(claudeMdOutput).to.equal(agentsMdOutput);
  expect(claudeMdOutput.length).to.be.greaterThan(0);
});
