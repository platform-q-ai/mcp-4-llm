export function getSourceFiles(name: string): Record<string, string> {
  return {
    // Entry point
    'src/index.ts': `import 'reflect-metadata';

import { setupContainer } from './di/container.js';
import { startServer } from './mcp/server.js';

setupContainer();
startServer();
`,

    // DI Container
    'src/di/container.ts': `import { container } from 'tsyringe';

/**
 * Configure the dependency injection container.
 * Register all dependencies here.
 */
export function setupContainer(): void {
  // Example registration:
  // container.registerSingleton(REPOSITORY_TOKEN, RepositoryImplementation);
}

export { container };
`,

    // DI Index
    'src/di/index.ts': `export * from './container.js';
`,

    // Domain - Base Error
    'src/domain/errors/base.error.ts': `/**
 * Error categories for classification
 */
export type ErrorCategory = 'validation' | 'not_found' | 'conflict' | 'external' | 'auth';

/**
 * Base class for all domain errors.
 * All domain errors must extend this class and provide:
 * - code: Machine-readable error code
 * - suggestedFix: How to resolve the error
 * - isRetryable: Whether the operation can be retried
 * - category: Error classification
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly suggestedFix: string;
  abstract readonly isRetryable: boolean;
  abstract readonly category: ErrorCategory;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to a structured object for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      suggestedFix: this.suggestedFix,
      isRetryable: this.isRetryable,
      category: this.category,
    };
  }
}
`,

    // Domain - Errors Index
    'src/domain/errors/index.ts': `export * from './base.error.js';
`,

    // Domain - Index
    'src/domain/index.ts': `export * from './errors/index.js';
`,

    // Application - Common Schema
    'src/application/schemas/common.schema.ts': `import { z } from 'zod';

/**
 * Pagination input schema
 */
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * ID schema - non-empty string
 */
export const idSchema = z.string().min(1, 'ID is required');

/**
 * Helper to validate input and return structured result
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => \`\${issue.path.join('.')}: \${issue.message}\`)
      .join(', ');
    return { success: false, error: errorMessages };
  }
  return { success: true, data: result.data };
}
`,

    // Application - Schemas Index
    'src/application/schemas/index.ts': `export * from './common.schema.js';
`,

    // Application - Ports Index
    'src/application/ports/index.ts': `// Export port interfaces here
// Example:
// export * from './example-repository.port.js';
`,

    // Application - Index
    'src/application/index.ts': `export * from './ports/index.js';
export * from './schemas/index.js';
`,

    // Infrastructure - Index
    'src/infrastructure/index.ts': `// Export infrastructure adapters here
// Example:
// export * from './persistence/sqlite-example-repository.js';
`,

    // MCP - Types
    'src/mcp/types.ts': `/**
 * MCP Tool definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCP Tool result
 */
export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Helper to create a success result
 */
export function successResult(data: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Helper to create an error result
 */
export function errorResult(error: unknown): ToolResult {
  const err = error as Error & { code?: string; suggestedFix?: string; isRetryable?: boolean };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            error: {
              code: err.code || 'UNKNOWN_ERROR',
              message: err.message || 'An unknown error occurred',
              suggestedFix: err.suggestedFix || 'Check the input and try again',
              isRetryable: err.isRetryable || false,
            },
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}
`,

    // MCP - Server
    'src/mcp/server.ts': `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: '${name}',
  version: '0.1.0',
});

/**
 * Register MCP tools here.
 * 
 * Example:
 * \`\`\`typescript
 * import { container } from '@/di';
 * import { CreateExampleTool } from './tools/create-example.tool.js';
 * 
 * const tool = container.resolve(CreateExampleTool);
 * server.tool(
 *   tool.definition.name,
 *   tool.definition.description,
 *   tool.definition.inputSchema,
 *   (args) => tool.execute(args)
 * );
 * \`\`\`
 */
function registerTools(): void {
  // Register your tools here
}

/**
 * Start the MCP server
 */
export async function startServer(): Promise<void> {
  registerTools();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('${name} MCP server running');
}
`,

    // MCP - Index
    'src/mcp/index.ts': `export * from './server.js';
export * from './types.js';
`,
  };
}
