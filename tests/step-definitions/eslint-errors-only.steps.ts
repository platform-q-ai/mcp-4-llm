import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { readFileSync } from 'fs';
import path from 'path';

import { getEslintConfig } from '../../templates/eslint-config.js';
import { GeneratorWorld } from './world.js';

let generatorConfig: string;
let templateConfig: string;

// ============================================
// Given steps for eslint config
// ============================================

Given('the generator eslint.config.js is loaded', function (this: GeneratorWorld) {
  const configPath = path.join(process.cwd(), 'eslint.config.js');
  generatorConfig = readFileSync(configPath, 'utf-8');
});

Given('the eslint config template is loaded', function (this: GeneratorWorld) {
  templateConfig = getEslintConfig();
});

// ============================================
// Then steps for generator config
// ============================================

Then('it should not have warn rules for complexity', function () {
  // Check that complexity rule is either 'error' or not present (not 'warn')
  expect(generatorConfig).to.not.match(/complexity.*['"]warn['"]/);
  expect(generatorConfig).to.not.match(/['"]warn['"].*complexity/);
});

Then('it should not have warn rules for max-depth', function () {
  expect(generatorConfig).to.not.match(/max-depth.*['"]warn['"]/);
  expect(generatorConfig).to.not.match(/['"]warn['"].*max-depth/);
});

Then('it should not have warn rules for max-lines-per-function', function () {
  expect(generatorConfig).to.not.match(/max-lines-per-function.*['"]warn['"]/);
  expect(generatorConfig).to.not.match(/['"]warn['"].*max-lines-per-function/);
});

Then('it should not have warn rules for max-params', function () {
  expect(generatorConfig).to.not.match(/max-params.*['"]warn['"]/);
  expect(generatorConfig).to.not.match(/['"]warn['"].*max-params/);
});

// ============================================
// Then steps for template config
// ============================================

Then('the template should use error for complexity rule', function () {
  expect(templateConfig).to.match(/complexity.*['"]error['"]/);
});

Then('the template should use error for max-depth rule', function () {
  expect(templateConfig).to.match(/max-depth.*['"]error['"]/);
});

Then('the template should use error for max-lines rule', function () {
  expect(templateConfig).to.match(/max-lines.*['"]error['"]/);
});

Then('the template should use error for max-lines-per-function rule', function () {
  expect(templateConfig).to.match(/max-lines-per-function.*['"]error['"]/);
});

Then('the template should use error for max-params rule', function () {
  expect(templateConfig).to.match(/max-params.*['"]error['"]/);
});
