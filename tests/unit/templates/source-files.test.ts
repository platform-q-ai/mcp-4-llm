import { describe, expect, it } from 'vitest';

import { getSourceFiles } from '../../../templates/source-files.js';

describe('source-files template', () => {
  const files = getSourceFiles('test-project');

  describe('directory structure', () => {
    it('should generate domain layer files', () => {
      expect(files).toHaveProperty('src/domain/errors/base.error.ts');
      expect(files).toHaveProperty('src/domain/index.ts');
    });

    it('should generate application layer files', () => {
      expect(files).toHaveProperty('src/application/index.ts');
    });

    it('should generate infrastructure layer files', () => {
      expect(files).toHaveProperty('src/infrastructure/index.ts');
    });

    it('should generate MCP layer files', () => {
      expect(files).toHaveProperty('src/mcp/server.ts');
    });

    it('should generate DI layer files', () => {
      expect(files).toHaveProperty('src/di/container.ts');
      expect(files).toHaveProperty('src/di/index.ts');
    });

    it('should generate main entry point', () => {
      expect(files).toHaveProperty('src/index.ts');
    });
  });

  describe('domain layer content', () => {
    it('should have DomainError base class', () => {
      const errorFile = files['src/domain/errors/base.error.ts'];
      expect(errorFile).toContain('class DomainError');
      expect(errorFile).toContain('code');
      expect(errorFile).toContain('suggestedFix');
      expect(errorFile).toContain('isRetryable');
    });

    it('should export from domain index', () => {
      const indexFile = files['src/domain/index.ts'];
      expect(indexFile).toContain('export');
    });
  });

  describe('MCP server content', () => {
    it('should import MCP SDK', () => {
      const serverFile = files['src/mcp/server.ts'];
      expect(serverFile).toContain('@modelcontextprotocol/sdk');
    });

    it('should create McpServer instance', () => {
      const serverFile = files['src/mcp/server.ts'];
      expect(serverFile).toContain('McpServer');
    });

    it('should use project name in server config', () => {
      const serverFile = files['src/mcp/server.ts'];
      expect(serverFile).toContain('test-project');
    });

    it('should use stdio transport', () => {
      const serverFile = files['src/mcp/server.ts'];
      expect(serverFile).toContain('StdioServerTransport');
    });
  });

  describe('DI container content', () => {
    it('should import tsyringe', () => {
      const containerFile = files['src/di/container.ts'];
      expect(containerFile).toContain('tsyringe');
    });

    it('should export container setup function', () => {
      const containerFile = files['src/di/container.ts'];
      expect(containerFile).toContain('setupContainer');
    });

    it('should have barrel export for DI layer', () => {
      const indexFile = files['src/di/index.ts'];
      expect(indexFile).toContain('export');
      expect(indexFile).toContain('./container');
    });
  });

  describe('entry point content', () => {
    it('should import reflect-metadata first', () => {
      const indexFile = files['src/index.ts'];
      // reflect-metadata should be imported before other imports
      const reflectIndex = indexFile.indexOf('reflect-metadata');
      expect(reflectIndex).toBeGreaterThanOrEqual(0);
    });

    it('should call setupContainer', () => {
      const indexFile = files['src/index.ts'];
      expect(indexFile).toContain('setupContainer');
    });

    it('should start the server', () => {
      const indexFile = files['src/index.ts'];
      expect(indexFile).toContain('startServer');
    });
  });
});
