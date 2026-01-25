import { describe, expect, it } from 'vitest';

import { getEslintConfig } from '../../../templates/eslint-config.js';

describe('eslint-config template', () => {
  const config = getEslintConfig();

  describe('syntax', () => {
    it('should be valid JavaScript module', () => {
      expect(config).toContain('export default');
    });

    it('should import required plugins', () => {
      expect(config).toContain('@eslint/js');
      expect(config).toContain('typescript-eslint');
      expect(config).toContain('eslint-plugin-boundaries');
      expect(config).toContain('eslint-plugin-simple-import-sort');
    });
  });

  describe('boundary rules', () => {
    it('should define architecture layers', () => {
      expect(config).toContain('domain');
      expect(config).toContain('application');
      expect(config).toContain('infrastructure');
      expect(config).toContain('mcp');
      expect(config).toContain('di');
    });

    it('should restrict domain imports', () => {
      // Domain should only import from domain
      expect(config).toContain('boundaries/element-types');
    });

    it('should configure external package restrictions', () => {
      expect(config).toContain('boundaries/external');
    });
  });

  describe('code quality rules', () => {
    it('should disallow explicit any', () => {
      expect(config).toContain('no-explicit-any');
    });

    it('should enforce import sorting', () => {
      expect(config).toContain('simple-import-sort/imports');
      expect(config).toContain('simple-import-sort/exports');
    });

    it('should set complexity limits', () => {
      expect(config).toContain('complexity');
      expect(config).toContain('max-depth');
      expect(config).toContain('max-lines');
    });
  });

  describe('ignore patterns', () => {
    it('should ignore node_modules', () => {
      expect(config).toContain('node_modules');
    });

    it('should ignore dist directory', () => {
      expect(config).toContain('dist');
    });
  });
});
