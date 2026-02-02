import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { getCodeQualityScript } from '../../templates/code-quality-script.js';
import { GeneratorWorld } from './world.js';

// Store the script content for the scenario
let scriptContent: string;

// ============================================
// Background step - load template directly
// ============================================

Given('the code quality script template is loaded', function (this: GeneratorWorld) {
  scriptContent = getCodeQualityScript();
});

// ============================================
// CHECK 1: Incomplete Work Markers
// ============================================

Then('the script should check for TODO in src', function () {
  expect(scriptContent).to.include('TODO');
  expect(scriptContent).to.include('src');
});

Then('the script should check for FIXME in src', function () {
  expect(scriptContent).to.include('FIXME');
});

Then('the script should check for XXX in src', function () {
  expect(scriptContent).to.include('XXX');
});

Then('the script should check for HACK in src', function () {
  expect(scriptContent).to.include('HACK');
});

Then('the script should check for BUG in src', function () {
  expect(scriptContent).to.include('BUG');
});

Then('the script should check for {string} in src', function (pattern: string) {
  expect(scriptContent).to.include(pattern);
  expect(scriptContent).to.include('src');
});

Then('the script should check for ".only\\(" pattern', function () {
  // The script uses escaped pattern for grep: \.only\(
  expect(scriptContent).to.include('.only');
});

Then('the script should check for ".skip\\(" pattern', function () {
  // The script uses escaped pattern for grep: \.skip\(
  expect(scriptContent).to.include('.skip');
});

// ============================================
// CHECK 2: Type Safety and Lint Bypasses
// ============================================

Then('the script should check for TODO in tests', function () {
  expect(scriptContent).to.include('TODO');
  expect(scriptContent).to.include('tests');
});

Then('the script should check for FIXME in tests', function () {
  expect(scriptContent).to.include('FIXME');
  expect(scriptContent).to.include('tests');
});

Then('the script should check for XXX in tests', function () {
  expect(scriptContent).to.include('XXX');
  expect(scriptContent).to.include('tests');
});

Then('the script should check for HACK in tests', function () {
  expect(scriptContent).to.include('HACK');
  expect(scriptContent).to.include('tests');
});

Then('the script should check for stub implementations with {string}', function (pattern: string) {
  expect(scriptContent).to.include(pattern);
});

// ============================================
// CHECK 3: Barrel Exports
// ============================================

Then('the script should check domain has index.ts', function () {
  expect(scriptContent).to.include('domain');
  expect(scriptContent).to.include('index.ts');
});

Then('the script should check application has index.ts', function () {
  expect(scriptContent).to.include('application');
  expect(scriptContent).to.include('index.ts');
});

Then('the script should check infrastructure has index.ts', function () {
  expect(scriptContent).to.include('infrastructure');
  expect(scriptContent).to.include('index.ts');
});

Then('the script should check mcp has index.ts', function () {
  expect(scriptContent).to.include('mcp');
  expect(scriptContent).to.include('index.ts');
});

Then('the script should check di has index.ts', function () {
  expect(scriptContent).to.include('di');
  expect(scriptContent).to.include('index.ts');
});

// ============================================
// CHECK 4: Zod Validation
// ============================================

Then('the script should check for Zod parse usage in use cases', function () {
  expect(scriptContent).to.include('use-cases');
  expect(scriptContent).to.match(/\.parse|safeParse/);
});

Then('the script should check use-cases for .parse or .safeParse', function () {
  expect(scriptContent).to.include('use-cases');
  expect(scriptContent).to.match(/parse|safeParse/);
});

// ============================================
// CHECK 5: Domain Error Structure
// ============================================

Then('the script should check base.error.ts has abstract code', function () {
  expect(scriptContent).to.include('base.error.ts');
  expect(scriptContent).to.include('code');
});

Then('the script should check base.error.ts has abstract suggestedFix', function () {
  expect(scriptContent).to.include('base.error.ts');
  expect(scriptContent).to.include('suggestedFix');
});

Then('the script should check base.error.ts has abstract isRetryable', function () {
  expect(scriptContent).to.include('base.error.ts');
  expect(scriptContent).to.include('isRetryable');
});

Then('the script should check base.error.ts has abstract category', function () {
  expect(scriptContent).to.include('base.error.ts');
  expect(scriptContent).to.include('category');
});

Then('the script should check domain errors have code property', function () {
  expect(scriptContent).to.include('domain');
  expect(scriptContent).to.include('error');
  expect(scriptContent).to.include('code');
});

Then('the script should check domain errors have suggestedFix property', function () {
  expect(scriptContent).to.include('suggestedFix');
});

Then('the script should check domain errors have isRetryable property', function () {
  expect(scriptContent).to.include('isRetryable');
});

Then('the script should check domain errors have category property', function () {
  expect(scriptContent).to.include('category');
});

// ============================================
// CHECK 6: BDD Feature Coverage
// ============================================

Then('the script should check features directory exists', function () {
  expect(scriptContent).to.include('features');
  expect(scriptContent).to.match(/-d.*features|features.*directory/);
});

Then('the script should check features directory is not empty', function () {
  expect(scriptContent).to.include('.feature');
  expect(scriptContent).to.include('features');
});

Then('the script should check feature files have Scenario definitions', function () {
  expect(scriptContent).to.match(/Scenario|SCENARIO_COUNT/i);
});

Then('the script should check step-definitions has .steps.ts files', function () {
  expect(scriptContent).to.include('step-definitions');
  expect(scriptContent).to.include('.steps.ts');
});

Then('the script should check use cases are covered by features', function () {
  expect(scriptContent).to.include('use-cases');
  expect(scriptContent).to.include('feature');
});

Then('the script should check minimum scenario count', function () {
  expect(scriptContent).to.match(/scenario.*count|TOTAL_SCENARIOS/i);
});

// ============================================
// CHECK 6g: Undefined/Pending Steps
// ============================================

Then('the script should use Cucumber dry-run to detect undefined steps', function () {
  expect(scriptContent).to.include('--dry-run');
  expect(scriptContent).to.match(/cucumber|npx cucumber-js/i);
});

Then('the script should fail if undefined steps are found', function () {
  expect(scriptContent).to.match(/undefined.*step|UNDEFINED_STEPS/i);
  expect(scriptContent).to.include('ERRORS_FOUND=1');
});

// ============================================
// CHECK 6h: Step Usage Statistics
// ============================================

Then('the script should count step definitions', function () {
  expect(scriptContent).to.match(/step.*definition.*count|STEP_DEF_COUNT/i);
});

Then('the script should count step usages in features', function () {
  expect(scriptContent).to.match(/step.*usage|STEP_USAGE_COUNT/i);
});

Then('the script should report step coverage statistics', function () {
  expect(scriptContent).to.match(/definition|usage|statistic/i);
});

// ============================================
// CHECK 7: Value Objects
// ============================================

Then('the script should check value objects throw DomainError', function () {
  expect(scriptContent).to.include('value-objects');
  expect(scriptContent).to.match(/throw.*Error|DomainError/);
});

// ============================================
// CHECK 8: MCP Tool Error Handling
// ============================================

Then('the script should check MCP tools have try-catch blocks', function () {
  expect(scriptContent).to.include('mcp');
  expect(scriptContent).to.include('try');
  expect(scriptContent).to.include('catch');
});

Then('the script should check MCP tools return structured errors', function () {
  expect(scriptContent).to.include('mcp');
  expect(scriptContent).to.match(/isError|error.*code|structured/i);
});

// ============================================
// CHECK 9: MCP Tools Registered
// ============================================

Then('the script should check tools are imported in server.ts', function () {
  expect(scriptContent).to.include('server.ts');
  expect(scriptContent).to.include('tool');
});

Then('the script should check tools are resolved from container', function () {
  expect(scriptContent).to.match(/resolve|container/);
});

// ============================================
// CHECK 10: Use Cases Exposed via MCP
// ============================================

Then('the script should check use cases are used by MCP tools', function () {
  expect(scriptContent).to.include('use-cases');
  expect(scriptContent).to.include('mcp');
  expect(scriptContent).to.match(/UseCase|use.*case/);
});

// ============================================
// CHECK 11: Barrel Exports Used
// ============================================

Then('the script should check tool exports are resolved in server', function () {
  expect(scriptContent).to.include('tools');
  expect(scriptContent).to.include('server');
});

// ============================================
// CHECK 12: Dead Code Detection
// ============================================

Then('the script should use ESLint to find unused variables', function () {
  expect(scriptContent).to.match(/eslint|no-unused-vars/i);
  expect(scriptContent).to.match(/unused.*variable|UNUSED_VARS/i);
});

Then('the script should fail if unused variables are found in src', function () {
  expect(scriptContent).to.match(/unused.*variable|UNUSED_VARS/i);
  expect(scriptContent).to.include('ERRORS_FOUND=1');
});

Then('the script should scan for source files not imported anywhere', function () {
  expect(scriptContent).to.match(/orphan|not.*imported|ORPHAN_FILES/i);
});

Then('the script should exclude test-only utilities from dead code check', function () {
  expect(scriptContent).to.match(/exclude|test.*util|in-memory|EXCLUDE_PATTERNS/i);
});

Then('the script should fail if orphan source files are found', function () {
  expect(scriptContent).to.match(/orphan|not.*imported/i);
  expect(scriptContent).to.include('ERRORS_FOUND=1');
});
