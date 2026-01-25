import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import path from 'path';

import { getVitestConfig } from '../../templates/vitest-config.js';
import { GeneratorWorld } from './world.js';

let generatorConfig: string;
let templateConfig: string;

// ============================================
// Given steps for coverage thresholds
// ============================================

Given('the generator vitest.config.ts is loaded', function (this: GeneratorWorld) {
  const configPath = path.join(process.cwd(), 'vitest.config.ts');
  generatorConfig = readFileSync(configPath, 'utf-8');
});

Given('the vitest config template is loaded', function (this: GeneratorWorld) {
  templateConfig = getVitestConfig();
});

// ============================================
// Then steps for generator config
// ============================================

Then('it should have 80% statement threshold', function () {
  expect(generatorConfig).to.match(/statements:\s*80/);
});

Then('it should have 80% branch threshold', function () {
  expect(generatorConfig).to.match(/branches:\s*80/);
});

Then('it should have 80% function threshold', function () {
  expect(generatorConfig).to.match(/functions:\s*80/);
});

Then('it should have 80% line threshold', function () {
  expect(generatorConfig).to.match(/lines:\s*80/);
});

// ============================================
// Then steps for template config
// ============================================

Then('the template should have 80% statement threshold', function () {
  expect(templateConfig).to.match(/statements:\s*80/);
});

Then('the template should have 80% branch threshold', function () {
  expect(templateConfig).to.match(/branches:\s*80/);
});

Then('the template should have 80% function threshold', function () {
  expect(templateConfig).to.match(/functions:\s*80/);
});

Then('the template should have 80% line threshold', function () {
  expect(templateConfig).to.match(/lines:\s*80/);
});
