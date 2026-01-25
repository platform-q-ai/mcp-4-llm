# create-open-mcp

[![npm version](https://badge.fury.io/js/create-open-mcp.svg)](https://www.npmjs.com/package/create-open-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool that generates LLM-ready MCP (Model Context Protocol) server projects with Clean Architecture, comprehensive linting, and autonomous development guardrails.

## Quick Start

```bash
# Generate a new project
npx create-open-mcp my-service --description "My MCP service"

# Start developing
cd my-service
npm run dev
```

## What Gets Generated

A fully configured MCP server project with:

```
my-service/
├── src/
│   ├── domain/           # Pure business logic (no external deps)
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── errors/
│   ├── application/      # Use cases and port interfaces
│   │   ├── use-cases/
│   │   ├── ports/
│   │   └── schemas/
│   ├── infrastructure/   # External adapters
│   ├── mcp/              # MCP server and tools
│   │   ├── server.ts
│   │   └── tools/
│   ├── di/               # Dependency injection
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── step-definitions/
│   └── mocks/
├── features/             # BDD feature files
├── scripts/
│   └── check-code-quality.sh
├── CLAUDE.md             # LLM development guide
├── agents.md             # LLM development guide (identical)
├── CONVENTIONS.md        # Naming conventions
├── TROUBLESHOOTING.md    # Common issues and fixes
└── [config files]
```

## Features

### Clean Architecture with Enforced Boundaries

ESLint rules prevent architectural violations:

| Layer          | Can Import                          | Cannot Import           |
| -------------- | ----------------------------------- | ----------------------- |
| domain         | domain                              | everything else         |
| application    | application, domain                 | infrastructure, mcp, di |
| infrastructure | infrastructure, application, domain | mcp, di                 |
| mcp            | mcp, application, di                | domain, infrastructure  |

### External Package Restrictions

- **Domain layer**: NO external packages (pure TypeScript)
- **Application layer**: No infrastructure packages (express, sqlite, etc.)

### Code Quality Checks

Pre-commit hooks block:

- TODO/FIXME comments
- `any` types
- console.log (use console.error for MCP)
- Empty catch blocks
- Stub implementations
- Test code in production

### Test Coverage Requirements

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

### Latest Package Versions

The generator fetches current versions from npm registry at generation time.

## Usage

```bash
npx create-open-mcp <project-name>
```

Or run interactively:

```bash
npx create-open-mcp
# Prompts for project name
```

## Generated Project Commands

| Command                 | Purpose               |
| ----------------------- | --------------------- |
| `npm run dev`           | Start with hot reload |
| `npm run build`         | Compile TypeScript    |
| `npm run start`         | Run production build  |
| `npm run test`          | Run all tests         |
| `npm run test:unit`     | Unit tests only       |
| `npm run test:features` | BDD tests only        |
| `npm run test:coverage` | Tests with coverage   |
| `npm run lint`          | Check for issues      |
| `npm run lint:fix`      | Auto-fix issues       |
| `npm run pre-commit`    | Full quality gate     |

## Development Workflow

The generated project enforces BDD-first development:

### 1. Write Feature File

```gherkin
# features/create-thing.feature
Feature: Create Thing
  Scenario: Successfully create a thing
    Given I have valid thing data
    When I create the thing
    Then the thing should be created
```

### 2. Implement Step Definitions

```typescript
// tests/step-definitions/create-thing.steps.ts
When('I create the thing', async function (this: CustomWorld) {
  const useCase = this.container.resolve(CreateThingUseCase);
  this.result = await useCase.execute(this.input);
});
```

### 3. Implement Inside-Out

Domain → Application → Infrastructure → MCP

### 4. Run Pre-commit

```bash
npm run pre-commit
```

All checks must pass before committing.

## LLM Development Guide

The generated `CLAUDE.md` and `agents.md` files contain comprehensive guidance for LLMs:

- Critical rules (NEVER DO / ALWAYS DO)
- Architecture diagrams
- Code patterns with examples
- Error handling patterns
- Testing patterns
- Common errors and fixes

These files are automatically loaded by Claude Code and compatible AI coding assistants.

## Customization

### Adding Dependencies

Edit `templates/package-json.ts`:

```typescript
export const dependencies = [
  '@modelcontextprotocol/sdk',
  'dotenv',
  // Add your packages here
];
```

### Modifying ESLint Rules

Edit `templates/eslint-config.ts` to add or modify rules.

### Changing File Templates

Edit files in `templates/` directory:

| File              | Purpose                      |
| ----------------- | ---------------------------- |
| `source-files.ts` | Generated source code        |
| `test-files.ts`   | Test setup files             |
| `agents-md.ts`    | LLM development guide        |
| `claude-md.ts`    | Imports from agents-md.ts    |
| `misc-files.ts`   | gitignore, conventions, etc. |

## Project Structure

```
create-open-mcp/
├── create-open-mcp.ts    # Main generator script
├── package.json
├── README.md
└── templates/
    ├── package-json.ts   # Dependencies and scripts
    ├── tsconfig.ts       # TypeScript configs
    ├── eslint-config.ts  # ESLint with boundaries
    ├── vitest-config.ts  # Test config with coverage
    ├── cucumber-config.ts
    ├── prettier-config.ts
    ├── agents-md.ts      # LLM guide (source of truth)
    ├── claude-md.ts      # Re-exports agents-md
    ├── code-quality-script.ts
    ├── source-files.ts
    ├── test-files.ts
    └── misc-files.ts
```

## Requirements

- Node.js 18+
- npm 9+

## License

MIT
