# create-open-mcp

[![npm version](https://badge.fury.io/js/create-open-mcp.svg)](https://www.npmjs.com/package/create-open-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool that generates LLM-ready MCP (Model Context Protocol) server projects with Clean Architecture, comprehensive linting, and autonomous development guardrails.

## Quick Start

```bash
npx create-open-mcp my-service
cd my-service
npm run dev
```

## Why Clean Architecture for LLM Development?

Clean Architecture isn't just about code organization—it's about creating **predictable patterns that LLMs can understand and follow consistently**.

### The Problem with Unstructured Codebases

When LLMs work with unstructured code, they face:

- **Inconsistent patterns** - Different approaches in different files
- **Unclear boundaries** - Business logic mixed with infrastructure concerns
- **Hidden dependencies** - Imports from anywhere to anywhere
- **Ambiguous error handling** - Mix of generic errors, exceptions, and return codes

This leads to LLMs generating inconsistent code, making incorrect assumptions, and producing solutions that don't fit the codebase's style.

### How Clean Architecture Helps LLMs

Clean Architecture provides **explicit, enforceable rules** that give LLMs clear context:

| Principle                | Benefit for LLMs                          |
| ------------------------ | ----------------------------------------- |
| **Layer separation**     | LLM knows exactly where to put new code   |
| **Dependency rules**     | LLM understands what can import what      |
| **Barrel exports**       | LLM uses consistent import patterns       |
| **Domain errors**        | LLM generates errors with codes and fixes |
| **Use case pattern**     | LLM follows input→validate→execute→output |
| **Port/adapter pattern** | LLM knows how to add new integrations     |

### Predictable Context = Better LLM Output

When an LLM sees a codebase with:

- Every error having `code`, `suggestedFix`, `isRetryable`, `category`
- Every use case validating input with Zod
- Every layer only importing from allowed layers
- Every subdirectory having a barrel export

...it can **confidently generate code that follows these patterns** because the rules are explicit and consistently enforced.

## What Gets Generated

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
└── [config files]
```

## Architecture Boundaries

ESLint rules enforce layer dependencies at compile time:

| Layer          | Can Import                           | Cannot Import           |
| -------------- | ------------------------------------ | ----------------------- |
| domain         | domain                               | everything else         |
| application    | application, domain                  | infrastructure, mcp, di |
| infrastructure | infrastructure, application, domain  | mcp, di                 |
| mcp            | mcp, application, di                 | domain, infrastructure  |
| di             | di, application, infrastructure, mcp | domain                  |

**Domain layer**: NO external packages allowed (pure TypeScript only)
**Application layer**: No infrastructure packages (express, sqlite, etc.)

## Pre-commit Quality Checks

The generated project includes comprehensive pre-commit checks that block commits containing incomplete or non-compliant code. All checks are **errors, not warnings**.

### Check 1: Incomplete Work Markers

| Check | Pattern                                         | Reason                                                |
| ----- | ----------------------------------------------- | ----------------------------------------------------- |
| 1a    | `TODO`, `FIXME`, `XXX`, `HACK`, `BUG`           | Incomplete work should be tracked in issues, not code |
| 1b    | `not implemented`, `placeholder`                | Stub code shouldn't be committed                      |
| 1c    | `mock`, `fake`, `dummy`, `stub` (standalone)    | Test utilities shouldn't leak into production         |
| 1c-2  | `Mock*`, `Fake*`, `Dummy*`, `Stub*` (camelCase) | Catches `MockService`, `FakeRepository` in production |
| 1d    | `.only(`, `.skip(`                              | Focused/skipped tests shouldn't be committed          |

### Check 2: Type Safety and Code Quality

| Check | Pattern                                   | Reason                                               |
| ----- | ----------------------------------------- | ---------------------------------------------------- |
| 2a    | `as any`                                  | Type assertions bypass TypeScript's safety           |
| 2b    | `@ts-ignore`, `@ts-expect-error`          | Suppressing errors hides real problems               |
| 2c    | `eslint-disable`                          | Disabling lint rules hides code quality issues       |
| 2d    | `TODO`/`FIXME` in tests                   | Test code should also be complete                    |
| 2e    | `throw new Error('not implemented')`      | Stub implementations shouldn't be committed          |
| 2f    | `console.log`                             | Use `console.error` for MCP (stdout is for protocol) |
| 2g    | `throw new Error()` in domain/application | Use DomainError with code, suggestedFix, isRetryable |
| 2h    | `reflect-metadata` not first import       | Required for tsyringe DI decorators to work          |

### Check 3: Barrel Exports

| Check | What                         | Reason                                                   |
| ----- | ---------------------------- | -------------------------------------------------------- |
| 3a    | Layer index.ts exists        | Each layer must have a public API                        |
| 3b    | Subdirectory index.ts exists | Subdirectories (entities, schemas, etc.) need barrels    |
| 3c    | No direct imports            | Use `../schemas/index.js` not `../schemas/foo.schema.js` |

### Check 4: Zod Validation

| Check | What                                        | Reason                                       |
| ----- | ------------------------------------------- | -------------------------------------------- |
| 4     | Use cases call `.parse()` or `.safeParse()` | All input must be validated with Zod schemas |

### Check 5: Domain Error Structure

| Check | What                                                          | Reason                                         |
| ----- | ------------------------------------------------------------- | ---------------------------------------------- |
| 5a    | `base.error.ts` has abstract properties                       | Base class must define error contract          |
| 5b    | Errors have `code`, `suggestedFix`, `isRetryable`, `category` | Structured errors enable better error handling |

### Check 6: BDD Feature Coverage

| Check | What                          | Reason                                        |
| ----- | ----------------------------- | --------------------------------------------- |
| 6a    | `features/` directory exists  | BDD is required for this architecture         |
| 6b    | Feature files exist           | At least one `.feature` file required         |
| 6c    | Features have scenarios       | Empty feature files aren't useful             |
| 6d    | Step definitions exist        | Features need implementations                 |
| 6e    | Use cases covered by features | Each use case should have BDD coverage        |
| 6f    | Minimum scenario count        | At least 2 scenarios per use case recommended |

### Check 7: Value Object Errors

| Check | What                            | Reason                                              |
| ----- | ------------------------------- | --------------------------------------------------- |
| 7     | Value objects throw DomainError | Generic `Error` lacks structure for proper handling |

### Check 8: MCP Tool Error Handling

| Check | What                           | Reason                                                |
| ----- | ------------------------------ | ----------------------------------------------------- |
| 8a    | Tools have try-catch           | MCP tools must handle errors gracefully               |
| 8b    | Tools return structured errors | Return `{isError: true, code, message, suggestedFix}` |

### Check 9: MCP Tool Registration

| Check | What                          | Reason                              |
| ----- | ----------------------------- | ----------------------------------- |
| 9     | Tools registered in server.ts | Tools must be wired up to be usable |

### Check 10: Use Case Exposure

| Check | What                            | Reason                                      |
| ----- | ------------------------------- | ------------------------------------------- |
| 10    | Use cases exposed via MCP tools | Business logic should be accessible via MCP |

### Check 11: Barrel Export Usage

| Check | What                             | Reason                     |
| ----- | -------------------------------- | -------------------------- |
| 11    | Server imports from tool barrels | Consistent import patterns |

## Test Coverage Requirements

Pre-commit enforces **80% coverage** on all metrics:

| Metric     | Threshold |
| ---------- | --------- |
| Statements | 80%       |
| Branches   | 80%       |
| Functions  | 80%       |
| Lines      | 80%       |

## ESLint Rules (All Errors)

Code quality rules are enforced as **errors**, not warnings:

| Rule                                 | Setting                   | Reason                              |
| ------------------------------------ | ------------------------- | ----------------------------------- |
| `complexity`                         | max 10                    | Keeps functions understandable      |
| `max-depth`                          | max 4                     | Prevents deeply nested code         |
| `max-lines`                          | max 750                   | Keeps files focused                 |
| `max-lines-per-function`             | max 100                   | Functions should do one thing       |
| `max-params`                         | max 4                     | Too many params = needs refactoring |
| `no-console`                         | error (allow warn, error) | stdout is for MCP protocol          |
| `@typescript-eslint/no-explicit-any` | error                     | Type safety is required             |

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

## Pre-commit Flow

```
npm run pre-commit
    │
    ├── check:code-quality    # Shell script checks (1-11)
    ├── lint                  # ESLint with boundaries
    ├── format:check          # Prettier formatting
    ├── typecheck             # TypeScript compilation
    ├── build                 # Production build
    ├── test:coverage         # Unit tests + 80% threshold
    └── test:features         # BDD/Cucumber tests
```

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

## Requirements

- Node.js 18+
- npm 9+

## License

MIT
