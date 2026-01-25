export function getAgentsMd(name: string): string {
  return `# ${name} - AI Agent Development Guide

> This file provides comprehensive guidance for AI agents working on this codebase.
> It is automatically loaded by Claude Code and compatible AI coding assistants.

## Project Overview

**${name}** is an MCP (Model Context Protocol) server built with Clean Architecture principles.
It is designed to be developed and maintained by autonomous LLM agents.

## Critical Rules

### 🚨 NEVER DO

1. **Never import infrastructure in domain layer**
2. **Never import external packages in domain layer**
3. **Never use \`any\` type in source code**
4. **Never leave TODO/FIXME comments** - complete the work or create an issue
5. **Never skip tests** - all code must have corresponding tests
6. **Never bypass pre-commit hooks** with \`--no-verify\`
7. **Never import internal files directly** - use barrel exports (index.ts)

### ✅ ALWAYS DO

1. **Always write BDD feature first** before implementing
2. **Always validate input with Zod schemas**
3. **Always use domain errors with codes and suggested fixes**
4. **Always export from index.ts barrel files**
5. **Always run \`npm run pre-commit\` before committing**
6. **Always maintain 80% test coverage**

## Architecture

### Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|----------------|--------------|
| **Domain** | Core business logic, entities, value objects, domain errors | None |
| **Application** | Use cases, port interfaces, validation schemas | Domain |
| **Infrastructure** | External adapters (DB, APIs, file system) | Application, Domain |
| **MCP** | Tool handlers, server setup | Application, DI |
| **DI** | Dependency injection wiring | All except Domain |

### Dependency Flow

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         Entry Point                          │
│                        (src/index.ts)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│       DI        │◄────────────│       MCP       │
│   (Container)   │             │    (Server)     │
└────────┬────────┘             └────────┬────────┘
         │                               │
         │    ┌──────────────────────────┘
         │    │
         ▼    ▼
┌─────────────────────────────────────────────────────────────┐
│                        Application                           │
│              (Use Cases, Ports, Schemas)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│     Domain      │             │ Infrastructure  │
│ (Entities, VOs) │◄────────────│   (Adapters)    │
└─────────────────┘             └─────────────────┘
\`\`\`

## BDD Development Workflow

### Step 1: Write Feature File

\`\`\`gherkin
# features/create-thing.feature
Feature: Create Thing
  As a user
  I want to create things
  So that I can manage my things

  Background:
    Given a clean database

  Scenario: Successfully create a thing
    Given I have valid thing data:
      | name        | description     |
      | My Thing    | A great thing   |
    When I create the thing
    Then the thing should be created
    And the thing should have an ID
    And the thing name should be "My Thing"

  Scenario: Fail to create thing without name
    Given I have thing data without a name
    When I create the thing
    Then I should receive an error with code "THING_NAME_REQUIRED"
    And the error should suggest "Provide a non-empty name parameter"
\`\`\`

### Step 2: Implement Step Definitions

\`\`\`typescript
// tests/step-definitions/create-thing.steps.ts
import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'chai';

import { CreateThingUseCase } from '../../src/application';

import { CustomWorld } from './world';

Before(async function (this: CustomWorld) {
  await this.init();
});

Given('a clean database', async function (this: CustomWorld) {
  // Reset test state
});

Given('I have valid thing data:', async function (this: CustomWorld, dataTable) {
  const data = dataTable.hashes()[0];
  this.input = {
    name: data.name,
    description: data.description,
  };
});

Given('I have thing data without a name', async function (this: CustomWorld) {
  this.input = { name: '', description: 'Some description' };
});

When('I create the thing', async function (this: CustomWorld) {
  try {
    const useCase = this.container.resolve(CreateThingUseCase);
    this.result = await useCase.execute(this.input);
    this.error = null;
  } catch (error) {
    this.error = error as Error;
    this.result = null;
  }
});

Then('the thing should be created', async function (this: CustomWorld) {
  expect(this.error).to.be.null;
  expect(this.result).to.exist;
});

Then('the thing should have an ID', async function (this: CustomWorld) {
  expect(this.result.id).to.be.a('string');
  expect(this.result.id.length).to.be.greaterThan(0);
});

Then('the thing name should be {string}', async function (this: CustomWorld, name: string) {
  expect(this.result.name).to.equal(name);
});

Then('I should receive an error with code {string}', async function (this: CustomWorld, code: string) {
  expect(this.error).to.exist;
  expect((this.error as any).code).to.equal(code);
});

Then('the error should suggest {string}', async function (this: CustomWorld, suggestion: string) {
  expect((this.error as any).suggestedFix).to.equal(suggestion);
});
\`\`\`

### Step 3: Implement Domain Layer

\`\`\`typescript
// src/domain/entities/thing.entity.ts
import { ThingNameRequiredError } from '../errors';

interface ThingProps {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export class Thing {
  private constructor(private readonly props: ThingProps) {}

  static create(params: { name: string; description?: string }): Thing {
    if (!params.name?.trim()) {
      throw new ThingNameRequiredError();
    }

    return new Thing({
      id: crypto.randomUUID(),
      name: params.name.trim(),
      description: params.description?.trim() || '',
      createdAt: new Date(),
    });
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string { return this.props.description; }
  get createdAt(): Date { return this.props.createdAt; }
}
\`\`\`

### Step 4: Implement Application Layer

\`\`\`typescript
// src/application/ports/thing-repository.port.ts
import { Thing } from '@/domain';

export interface IThingRepository {
  findById(id: string): Promise<Thing | null>;
  save(thing: Thing): Promise<void>;
}

export const THING_REPOSITORY_TOKEN = Symbol('THING_REPOSITORY_TOKEN');
\`\`\`

\`\`\`typescript
// src/application/use-cases/create-thing.use-case.ts
import { injectable, inject } from 'tsyringe';

import { Thing } from '@/domain';

import { IThingRepository, THING_REPOSITORY_TOKEN } from '../ports';

@injectable()
export class CreateThingUseCase {
  constructor(
    @inject(THING_REPOSITORY_TOKEN) private readonly repo: IThingRepository
  ) {}

  async execute(input: { name: string; description?: string }) {
    const thing = Thing.create(input);
    await this.repo.save(thing);
    return { id: thing.id, name: thing.name, description: thing.description };
  }
}
\`\`\`

### Step 5: Implement Infrastructure

\`\`\`typescript
// src/infrastructure/persistence/in-memory-thing.repository.ts
import { Thing } from '@/domain';
import { IThingRepository } from '@/application';

export class InMemoryThingRepository implements IThingRepository {
  private things = new Map<string, Thing>();

  async findById(id: string): Promise<Thing | null> {
    return this.things.get(id) || null;
  }

  async save(thing: Thing): Promise<void> {
    this.things.set(thing.id, thing);
  }
}
\`\`\`

### Step 6: Wire Up DI

\`\`\`typescript
// src/di/container.ts
import { container } from 'tsyringe';

import { THING_REPOSITORY_TOKEN } from '@/application';
import { InMemoryThingRepository } from '@/infrastructure';

export function setupContainer() {
  container.registerSingleton(THING_REPOSITORY_TOKEN, InMemoryThingRepository);
}

export { container };
\`\`\`

### Step 7: Create MCP Tool

\`\`\`typescript
// src/mcp/tools/create-thing.tool.ts
import { injectable } from 'tsyringe';

import { CreateThingUseCase } from '@/application';

@injectable()
export class CreateThingTool {
  constructor(private readonly useCase: CreateThingUseCase) {}

  get definition() {
    return {
      name: 'create_thing',
      description: 'Create a new thing',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Thing name' },
          description: { type: 'string', description: 'Thing description' },
        },
        required: ['name'],
      },
    };
  }

  async execute(args: { name: string; description?: string }) {
    const result = await this.useCase.execute(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }
}
\`\`\`

## Error Handling

### Domain Errors

All domain errors must extend \`DomainError\` and include:

- \`code\`: Machine-readable error code (e.g., \`THING_NAME_REQUIRED\`)
- \`message\`: Human-readable message
- \`suggestedFix\`: How to resolve the error
- \`isRetryable\`: Whether the operation can be retried
- \`category\`: Error category (validation, not_found, conflict, external, auth)

\`\`\`typescript
// src/domain/errors/thing.errors.ts
import { DomainError } from './base.error';

export class ThingNameRequiredError extends DomainError {
  readonly code = 'THING_NAME_REQUIRED';
  readonly suggestedFix = 'Provide a non-empty name parameter';
  readonly isRetryable = false;
  readonly category = 'validation';

  constructor() {
    super('Thing name is required');
  }
}

export class ThingNotFoundError extends DomainError {
  readonly code = 'THING_NOT_FOUND';
  readonly suggestedFix = 'Verify the thing ID exists';
  readonly isRetryable = false;
  readonly category = 'not_found';

  constructor(id: string) {
    super(\`Thing with ID "\${id}" not found\`);
  }
}
\`\`\`

### MCP Error Responses

Tools should return structured error responses:

\`\`\`json
{
  "error": {
    "code": "THING_NAME_REQUIRED",
    "message": "Thing name is required",
    "suggestedFix": "Provide a non-empty name parameter",
    "isRetryable": false
  }
}
\`\`\`

## Validation with Zod

### Input Schemas

\`\`\`typescript
// src/application/schemas/create-thing.schema.ts
import { z } from 'zod';

export const CreateThingSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less')
    .transform((s) => s.trim()),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .transform((s) => s?.trim()),
});

export type CreateThingInput = z.infer<typeof CreateThingSchema>;
\`\`\`

### Validation in Use Cases

\`\`\`typescript
async execute(input: unknown): Promise<CreateThingOutput> {
  // Validate and transform input
  const validated = CreateThingSchema.parse(input);
  
  // Use validated data
  const thing = Thing.create(validated);
  // ...
}
\`\`\`

## Testing Patterns

### Unit Tests (Vitest)

\`\`\`typescript
// tests/unit/domain/entities/thing.entity.test.ts
import { describe, it, expect } from 'vitest';

import { Thing } from '../../../../src/domain/entities/thing.entity';
import { ThingNameRequiredError } from '../../../../src/domain/errors';

describe('Thing Entity', () => {
  describe('create', () => {
    it('should create a thing with valid data', () => {
      const thing = Thing.create({ name: 'Test Thing' });

      expect(thing.id).toBeDefined();
      expect(thing.name).toBe('Test Thing');
    });

    it('should trim whitespace from name', () => {
      const thing = Thing.create({ name: '  Test Thing  ' });

      expect(thing.name).toBe('Test Thing');
    });

    it('should throw ThingNameRequiredError when name is empty', () => {
      expect(() => Thing.create({ name: '' })).toThrow(ThingNameRequiredError);
    });

    it('should throw ThingNameRequiredError when name is whitespace', () => {
      expect(() => Thing.create({ name: '   ' })).toThrow(ThingNameRequiredError);
    });
  });
});
\`\`\`

### BDD Tests (Cucumber)

See the BDD Development Workflow section above.

## MCP Tool Implementation

### Tool Structure

Each tool should:

1. Be an injectable class
2. Have a \`definition\` getter for schema
3. Have an \`execute\` method for logic
4. Handle errors and return structured responses

### Registering Tools

\`\`\`typescript
// src/mcp/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { container } from '@/di';

import { CreateThingTool } from './tools/create-thing.tool';

const server = new McpServer({
  name: '${name}',
  version: '0.1.0',
});

export async function startServer() {
  // Register tools
  const createThingTool = container.resolve(CreateThingTool);
  
  server.tool(
    createThingTool.definition.name,
    createThingTool.definition.description,
    createThingTool.definition.inputSchema,
    (args) => createThingTool.execute(args)
  );

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${name} MCP server running');
}
\`\`\`

## Barrel Exports

Every layer must have an \`index.ts\` that exports its public API:

\`\`\`typescript
// src/domain/index.ts
export * from './entities/thing.entity';
export * from './value-objects/thing-id.vo';
export * from './errors';

// src/application/index.ts
export * from './use-cases/create-thing.use-case';
export * from './ports';
export * from './schemas/create-thing.schema';

// src/infrastructure/index.ts
export * from './persistence/in-memory-thing.repository';
\`\`\`

## Commands Reference

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start with hot reload |
| \`npm run build\` | Compile to dist/ |
| \`npm run start\` | Run compiled version |
| \`npm run typecheck\` | Check types without emitting |
| \`npm run lint\` | Run ESLint |
| \`npm run lint:fix\` | Fix ESLint issues |
| \`npm run format\` | Format with Prettier |
| \`npm run format:check\` | Check formatting |
| \`npm run test\` | Run all tests |
| \`npm run test:unit\` | Run unit tests |
| \`npm run test:features\` | Run BDD tests |
| \`npm run test:coverage\` | Run with coverage |
| \`npm run check:code-quality\` | Check for TODOs, stubs |
| \`npm run pre-commit\` | Full quality gate |

## Checklist Before Committing

- [ ] All tests pass (\`npm run test\`)
- [ ] No linting errors (\`npm run lint\`)
- [ ] Code is formatted (\`npm run format:check\`)
- [ ] Types are correct (\`npm run typecheck\`)
- [ ] No TODOs or FIXMEs in code
- [ ] Coverage thresholds met (80%)
- [ ] Feature file exists for new functionality
- [ ] Barrel exports updated
- [ ] Domain errors have codes and suggested fixes
`;
}
