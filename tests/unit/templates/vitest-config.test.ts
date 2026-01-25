import { describe, expect, it } from 'vitest';

import { getVitestConfig } from '../../../templates/vitest-config.js';

describe('vitest-config template', () => {
  const config = getVitestConfig();

  describe('syntax', () => {
    it('should be valid TypeScript', () => {
      expect(config).toContain('import');
      expect(config).toContain('export default');
    });

    it('should import from vitest/config', () => {
      expect(config).toContain('vitest/config');
    });
  });

  describe('test configuration', () => {
    it('should set environment to node', () => {
      expect(config).toContain("environment: 'node'");
    });

    it('should enable globals', () => {
      expect(config).toContain('globals: true');
    });

    it('should include unit test files', () => {
      expect(config).toContain('tests/unit');
    });
  });

  describe('coverage configuration', () => {
    it('should use v8 provider', () => {
      expect(config).toContain("provider: 'v8'");
    });

    it('should include src directory', () => {
      expect(config).toContain("include: ['src/**/*.ts']");
    });

    it('should exclude test files from coverage', () => {
      expect(config).toContain('tests');
    });

    it('should set statement threshold to 80%', () => {
      expect(config).toContain('statements: 80');
    });

    it('should set branch threshold to 80%', () => {
      expect(config).toContain('branches: 80');
    });

    it('should set function threshold to 80%', () => {
      expect(config).toContain('functions: 80');
    });

    it('should set line threshold to 80%', () => {
      expect(config).toContain('lines: 80');
    });
  });
});
