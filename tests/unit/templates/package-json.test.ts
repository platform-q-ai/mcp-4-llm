import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { dependencies, devDependencies, getPackageJson } from '../../../templates/package-json.js';

describe('package-json template', () => {
  beforeEach(() => {
    // Mock console to suppress output during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPackageJson', () => {
    it('should generate valid JSON', async () => {
      const result = await getPackageJson('test-project', 'Test description');

      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should include project name', async () => {
      const result = await getPackageJson('my-service', 'My service');
      const pkg = JSON.parse(result);

      expect(pkg.name).toBe('my-service');
    });

    it('should include project description', async () => {
      const result = await getPackageJson('test', 'A great service');
      const pkg = JSON.parse(result);

      expect(pkg.description).toBe('A great service');
    });

    it('should include required scripts', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.scripts).toHaveProperty('build');
      expect(pkg.scripts).toHaveProperty('test');
      expect(pkg.scripts).toHaveProperty('pre-commit');
      expect(pkg.scripts).toHaveProperty('lint');
      expect(pkg.scripts).toHaveProperty('typecheck');
      expect(pkg.scripts).toHaveProperty('format');
      expect(pkg.scripts).toHaveProperty('dev');
      expect(pkg.scripts).toHaveProperty('start');
    });

    it('should include MCP SDK dependency', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
    });

    it('should include zod for validation', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.dependencies).toHaveProperty('zod');
    });

    it('should include tsyringe for DI', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.dependencies).toHaveProperty('tsyringe');
    });

    it('should include test tools in devDependencies', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.devDependencies).toHaveProperty('vitest');
      expect(pkg.devDependencies).toHaveProperty('@cucumber/cucumber');
      expect(pkg.devDependencies).toHaveProperty('chai');
    });

    it('should include ESLint tools in devDependencies', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.devDependencies).toHaveProperty('eslint');
      expect(pkg.devDependencies).toHaveProperty('eslint-plugin-boundaries');
    });

    it('should set type to module', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.type).toBe('module');
    });

    it('should configure lint-staged', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg['lint-staged']).toHaveProperty('*.ts');
    });

    it('should include husky prepare script', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.scripts.prepare).toBe('husky');
    });

    it('should set version to 0.1.0', async () => {
      const result = await getPackageJson('test', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.version).toBe('0.1.0');
    });

    it('should include bin entry with project name', async () => {
      const result = await getPackageJson('my-mcp-server', 'Test');
      const pkg = JSON.parse(result);

      expect(pkg.bin).toHaveProperty('my-mcp-server');
      expect(pkg.bin['my-mcp-server']).toBe('./dist/index.js');
    });
  });

  describe('dependency lists', () => {
    it('should have core dependencies', () => {
      expect(dependencies).toContain('@modelcontextprotocol/sdk');
      expect(dependencies).toContain('zod');
      expect(dependencies).toContain('tsyringe');
      expect(dependencies).toContain('dotenv');
    });

    it('should have test devDependencies', () => {
      expect(devDependencies).toContain('vitest');
      expect(devDependencies).toContain('@cucumber/cucumber');
      expect(devDependencies).toContain('chai');
    });

    it('should have linting devDependencies', () => {
      expect(devDependencies).toContain('eslint');
      expect(devDependencies).toContain('prettier');
      expect(devDependencies).toContain('eslint-plugin-boundaries');
    });

    it('should have typescript devDependencies', () => {
      expect(devDependencies).toContain('typescript');
      expect(devDependencies).toContain('@types/node');
    });
  });
});
