import { describe, expect, it } from 'vitest';

import { getCodeQualityScript } from '../../../templates/code-quality-script.js';

describe('code-quality-script template', () => {
  const script = getCodeQualityScript();

  describe('syntax', () => {
    it('should be a bash script', () => {
      expect(script).toContain('#!/bin/bash');
    });

    it('should use set -e for error handling', () => {
      expect(script).toContain('set -e');
    });
  });

  describe('incomplete work markers', () => {
    it('should check for TODO comments', () => {
      expect(script).toContain('TODO');
    });

    it('should check for FIXME comments', () => {
      expect(script).toContain('FIXME');
    });

    it('should check for XXX comments', () => {
      expect(script).toContain('XXX');
    });

    it('should check for HACK comments', () => {
      expect(script).toContain('HACK');
    });

    it('should check for BUG comments', () => {
      expect(script).toContain('BUG');
    });
  });

  describe('type safety checks', () => {
    it('should check for as any', () => {
      expect(script).toContain('as any');
    });

    it('should check for @ts-ignore', () => {
      expect(script).toContain('@ts-ignore');
    });

    it('should check for @ts-expect-error', () => {
      expect(script).toContain('@ts-expect-error');
    });
  });

  describe('lint bypass checks', () => {
    it('should check for eslint-disable', () => {
      expect(script).toContain('eslint-disable');
    });
  });

  describe('console checks', () => {
    it('should check for console.log', () => {
      expect(script).toContain('console.log');
    });
  });

  describe('stub implementation checks', () => {
    it('should check for throw new Error not implement', () => {
      expect(script).toContain('throw new Error');
      expect(script).toContain('not.*implement');
    });

    it('should check for placeholder text', () => {
      expect(script).toContain('placeholder');
    });
  });

  describe('test quality checks', () => {
    it('should check for .only(', () => {
      expect(script).toContain('only');
      expect(script).toMatch(/\.only/);
    });

    it('should check for .skip(', () => {
      expect(script).toContain('skip');
      expect(script).toMatch(/\.skip/);
    });
  });

  describe('architecture checks', () => {
    it('should check for barrel exports (index.ts)', () => {
      expect(script).toContain('index.ts');
      expect(script).toContain('domain');
      expect(script).toContain('application');
      expect(script).toContain('infrastructure');
    });

    it('should check for feature files', () => {
      expect(script).toContain('.feature');
      expect(script).toContain('features');
    });
  });

  describe('domain error structure checks', () => {
    it('should check for code property in domain errors', () => {
      expect(script).toContain('domain');
      expect(script).toContain('error');
      expect(script).toContain('code');
    });

    it('should check for suggestedFix property in domain errors', () => {
      expect(script).toContain('suggestedFix');
    });
  });

  describe('Zod validation checks', () => {
    it('should check for .parse() in use cases', () => {
      expect(script).toContain('use-cases');
      expect(script).toMatch(/\.parse\(/);
    });
  });

  describe('MCP error handling checks', () => {
    it('should check for try-catch in MCP tools', () => {
      expect(script).toContain('mcp');
      expect(script).toContain('try');
      expect(script).toContain('catch');
    });

    it('should check for structured error responses in MCP tools', () => {
      expect(script).toContain('isError');
    });
  });

  describe('output', () => {
    it('should exit with error on failure', () => {
      expect(script).toContain('exit 1');
    });

    it('should report success', () => {
      expect(script).toMatch(/passed|success/i);
    });
  });

  describe('undefined steps detection (CHECK 6g)', () => {
    it('should use Cucumber dry-run to detect undefined steps', () => {
      expect(script).toContain('--dry-run');
      expect(script).toMatch(/cucumber-js|npx cucumber/i);
    });

    it('should check for undefined steps in output', () => {
      expect(script).toMatch(/undefined.*step|UNDEFINED_STEPS/i);
    });

    it('should set ERRORS_FOUND when undefined steps exist', () => {
      // The script should fail if undefined steps are found
      // Check that the undefined steps section sets ERRORS_FOUND=1
      expect(script).toContain('UNDEFINED_STEPS');
      expect(script).toContain('ERRORS_FOUND=1');
    });
  });

  describe('step usage statistics (CHECK 6h)', () => {
    it('should count step definitions', () => {
      expect(script).toMatch(/STEP_DEF_COUNT|step.*definition.*count/i);
    });

    it('should count step usages in features', () => {
      expect(script).toMatch(/STEP_USAGE_COUNT|step.*usage/i);
    });

    it('should report statistics about step coverage', () => {
      expect(script).toMatch(/definition|usage/i);
    });
  });

  describe('dead code detection (CHECK 12)', () => {
    it('should use ESLint to find unused variables', () => {
      expect(script).toMatch(/eslint.*no-unused-vars|UNUSED_VARS/i);
    });

    it('should scan for orphan source files not imported anywhere', () => {
      expect(script).toMatch(/orphan|ORPHAN_FILES|not.*imported/i);
    });

    it('should exclude test utilities from orphan check', () => {
      expect(script).toMatch(/exclude.*test|EXCLUDE_PATTERNS|in-memory/i);
    });

    it('should set ERRORS_FOUND when dead code is detected', () => {
      // Check that both unused vars and orphan files can trigger errors
      expect(script).toContain('ERRORS_FOUND=1');
    });
  });
});
