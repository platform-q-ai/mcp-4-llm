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

**Clean Architecture isn't just about code organization—it's about creating predictable patterns that LLMs can understand, follow, and generate consistently.**

### The Core Insight: LLMs Need Patterns, Not Freedom

When an LLM works with your codebase, it builds a mental model from the code it reads. The more consistent and explicit your patterns are, the better the LLM can:

1. **Understand existing code** - Recognize what each file does based on its location and naming
2. **Generate new code** - Follow established patterns when creating new features
3. **Make correct decisions** - Know where to put things and what to import
4. **Catch mistakes** - Identify when something violates the established patterns

### The Problem with Unstructured Codebases

Without explicit architecture, LLMs face constant ambiguity:

| Problem                                 | LLM Consequence                                              |
| --------------------------------------- | ------------------------------------------------------------ |
| Business logic mixed with HTTP handlers | LLM puts logic in wrong places                               |
| Inconsistent error handling             | LLM generates mix of `throw`, return codes, and Result types |
| No import conventions                   | LLM creates circular dependencies                            |
| Database calls in domain logic          | LLM couples business rules to infrastructure                 |
| Various testing approaches              | LLM generates inconsistent test styles                       |

This leads to **drift**—each LLM-generated change makes the codebase slightly less consistent, compounding over time.

### How Clean Architecture Solves This

Clean Architecture provides **explicit, machine-readable rules** that constrain LLM output:

#### 1. Layer Separation = Clear Placement Rules

```
src/
├── domain/           # Pure business logic, no imports from other layers
├── application/      # Use cases, orchestration, ports (interfaces)
├── infrastructure/   # External adapters (DB, HTTP, files)
├── mcp/              # MCP protocol layer (tools, server)
└── di/               # Dependency injection wiring
```

When an LLM needs to add a "validate email" function, it knows:

- Pure validation logic → `domain/value-objects/`
- Orchestrating multiple validations → `application/use-cases/`
- Calling an email verification API → `infrastructure/services/`

**No ambiguity. No discussion needed.**

#### 2. Dependency Rules = Predictable Imports

| Layer          | Can Import                           | Cannot Import           |
| -------------- | ------------------------------------ | ----------------------- |
| domain         | domain only                          | everything else         |
| application    | application, domain                  | infrastructure, mcp, di |
| infrastructure | infrastructure, application, domain  | mcp, di                 |
| mcp            | mcp, application, di                 | domain, infrastructure  |
| di             | di, application, infrastructure, mcp | domain                  |

These rules are **enforced by ESLint at compile time**. An LLM cannot accidentally create:

- Domain code that imports `express`
- Use cases that directly call the database
- Circular dependencies between layers

#### 3. Barrel Exports = Consistent Import Patterns

Every directory has an `index.ts` that exports its public API:

```typescript
// LLM always writes this:
import { User, Email } from '../domain/index.js';

// Never this:
import { User } from '../domain/entities/user.entity.js';
import { Email } from '../domain/value-objects/email.vo.js';
```

This gives LLMs a **single, predictable import pattern** to follow.

#### 4. Structured Errors = Rich Error Context

Every error must have:

```typescript
{
  code: 'USER_NOT_FOUND',        // Machine-readable identifier
  message: 'User not found',     // Human-readable description
  suggestedFix: 'Check the user ID', // Actionable guidance
  isRetryable: false,            // Can the operation be retried?
  category: 'not_found'          // Error classification
}
```

When an LLM generates error handling, it produces **consistent, informative errors** that help both humans and other LLMs understand what went wrong.

#### 5. Use Case Pattern = Predictable Flow

Every use case follows the same structure:

```typescript
class CreateUserUseCase {
  async execute(input: unknown): Promise<User> {
    // 1. Validate input with Zod
    const validated = CreateUserSchema.parse(input);

    // 2. Execute business logic
    const user = User.create(validated);

    // 3. Persist via port
    await this.userRepository.save(user);

    // 4. Return result
    return user;
  }
}
```

LLMs can **reliably generate new use cases** because the pattern is explicit and enforced.

### The Compound Effect

Each constraint multiplies the others' effectiveness:

- Layer rules + Barrel exports = No import confusion
- Structured errors + Use case pattern = Consistent error propagation
- Domain isolation + Port/adapter = Easy to add new integrations
- BDD features + Use cases = Tests that match business requirements

**Result: LLMs generate code that fits seamlessly into your codebase, maintaining consistency even across thousands of AI-assisted changes.**

## What Gets Generated

```
my-service/
├── src/
│   ├── domain/           # Pure business logic (no external deps)
│   │   ├── entities/     # Core business objects
│   │   ├── value-objects/# Immutable, validated types
│   │   └── errors/       # Domain-specific errors
│   ├── application/      # Use cases and port interfaces
│   │   ├── use-cases/    # Business operations
│   │   ├── ports/        # Interface definitions
│   │   └── schemas/      # Zod validation schemas
│   ├── infrastructure/   # External adapters
│   ├── mcp/              # MCP server and tools
│   │   ├── server.ts     # MCP server setup
│   │   └── tools/        # MCP tool implementations
│   ├── di/               # Dependency injection
│   └── index.ts          # Entry point
├── tests/
│   ├── unit/             # Unit tests
│   ├── step-definitions/ # BDD step implementations
│   └── mocks/            # Test doubles
├── features/             # BDD feature files
├── scripts/
│   └── check-code-quality.sh
├── CLAUDE.md             # LLM development guide
├── AGENTS.md             # LLM development guide (identical)
└── [config files]
```

## Pre-commit Quality Checks

The generated project includes **41 quality checks** that block commits containing incomplete or non-compliant code. All checks are **errors, not warnings**.

### Philosophy: Shift Left, Fail Fast

Every check exists for a specific reason:

1. **Catch problems before they compound** - A TODO today becomes technical debt tomorrow
2. **Maintain LLM context quality** - Inconsistent code confuses future LLM interactions
3. **Enforce architectural boundaries** - Violations are easier to prevent than fix
4. **Ensure production readiness** - No placeholder code in production

---

### Check 1: Incomplete Work Markers

**Why:** Incomplete work should be tracked in issues, not hidden in code. TODOs and stubs that slip into production become invisible technical debt.

| Check | Pattern                                     | Rationale                                             |
| ----- | ------------------------------------------- | ----------------------------------------------------- |
| 1a    | `TODO`, `FIXME`, `XXX`, `HACK`, `BUG`       | Work items belong in issue tracker, not code comments |
| 1b    | `not implemented`, `placeholder`            | Stub code indicates unfinished work                   |
| 1c    | `mock`, `fake`, `dummy`, `stub`             | Test utilities must not leak into production          |
| 1c-2  | `MockService`, `FakeRepository` (CamelCase) | Catches test doubles with class-style naming          |
| 1d    | `.only(`, `.skip(`                          | Focused/skipped tests break CI and hide failures      |

**LLM Benefit:** LLMs won't learn to generate placeholder code because none exists in the codebase.

---

### Check 2: Type Safety and Code Quality

**Why:** Type safety bypasses and lint suppressions hide real problems. They also teach LLMs bad habits.

| Check | Pattern                                   | Rationale                                                     |
| ----- | ----------------------------------------- | ------------------------------------------------------------- |
| 2a    | `as any`                                  | Type assertions bypass TypeScript's safety guarantees         |
| 2b    | `@ts-ignore`, `@ts-expect-error`          | Error suppression hides real type problems                    |
| 2c    | `eslint-disable`                          | Lint bypasses hide code quality issues                        |
| 2d    | `TODO`/`FIXME` in tests                   | Test code should be as complete as production code            |
| 2e    | `throw new Error('not implemented')`      | Stub implementations indicate unfinished work                 |
| 2f    | `console.log`                             | MCP uses stdout for protocol; use `console.error` for logging |
| 2g    | `throw new Error()` in domain/application | Generic errors lack structure; use `DomainError`              |
| 2h    | `reflect-metadata` not first import       | tsyringe decorators require metadata polyfill loaded first    |

**LLM Benefit:** LLMs learn to use proper types and structured errors instead of shortcuts.

---

### Check 3: Barrel Exports

**Why:** Consistent import patterns reduce cognitive load for both humans and LLMs. Barrel exports create a clear public API for each module.

| Check | What                           | Rationale                                                 |
| ----- | ------------------------------ | --------------------------------------------------------- |
| 3a    | Layer `index.ts` exists        | Each layer must expose a public API                       |
| 3b    | Subdirectory `index.ts` exists | Nested modules (entities, schemas) need barrels too       |
| 3c    | No direct file imports         | Use `../schemas/index.js` not `../schemas/user.schema.js` |

**LLM Benefit:** LLMs always generate the same import pattern: `from '../layer/index.js'`.

---

### Check 4: Zod Validation

**Why:** All external input must be validated. Zod provides runtime validation with TypeScript type inference.

| Check | What                                        | Rationale                              |
| ----- | ------------------------------------------- | -------------------------------------- |
| 4     | Use cases call `.parse()` or `.safeParse()` | Every use case must validate its input |

**LLM Benefit:** LLMs learn that validation is mandatory, not optional.

---

### Check 5: Domain Error Structure

**Why:** Structured errors enable consistent error handling, helpful error messages, and retry logic.

| Check | What                                                          | Rationale                                       |
| ----- | ------------------------------------------------------------- | ----------------------------------------------- |
| 5a    | `base.error.ts` has abstract properties                       | Base class defines the error contract           |
| 5b    | Errors have `code`, `suggestedFix`, `isRetryable`, `category` | Every error must provide actionable information |

**LLM Benefit:** LLMs generate errors with all required fields, enabling rich error handling throughout the system.

---

### Check 6: BDD Feature Coverage

**Why:** BDD features serve as executable documentation. They ensure business requirements are tested and provide examples for LLMs.

| Check | What                          | Rationale                                      |
| ----- | ----------------------------- | ---------------------------------------------- |
| 6a    | `features/` directory exists  | BDD is a core architectural requirement        |
| 6b    | Feature files exist           | At least one `.feature` file required          |
| 6c    | Features have scenarios       | Empty feature files provide no value           |
| 6d    | Step definitions exist        | Features need implementations to be executable |
| 6e    | Use cases covered by features | Business logic should have BDD coverage        |
| 6f    | Minimum scenario count        | Recommend ≥2 scenarios per use case            |

**LLM Benefit:** LLMs can read feature files to understand business requirements before generating code.

---

### Check 7: Value Object Errors

**Why:** Value objects are the first line of validation. They must throw structured errors, not generic ones.

| Check | What                              | Rationale                                           |
| ----- | --------------------------------- | --------------------------------------------------- |
| 7     | Value objects throw `DomainError` | Generic `Error` lacks structure for proper handling |

**LLM Benefit:** LLMs learn to use domain errors even in the simplest validation code.

---

### Check 8: MCP Tool Error Handling

**Why:** MCP tools are the external interface. They must handle errors gracefully and return structured responses.

| Check | What                           | Rationale                                             |
| ----- | ------------------------------ | ----------------------------------------------------- |
| 8a    | Tools have try-catch           | Every tool must handle errors                         |
| 8b    | Tools return structured errors | Return `{isError: true, code, message, suggestedFix}` |

**LLM Benefit:** LLMs generate robust tool implementations that never crash on unexpected input.

---

### Check 9: MCP Tool Registration

**Why:** Tools must be wired up to be callable. Unregistered tools are dead code.

| Check | What                            | Rationale                                          |
| ----- | ------------------------------- | -------------------------------------------------- |
| 9     | Tools registered in `server.ts` | Tools must be imported and resolved from container |

**LLM Benefit:** LLMs learn the complete pattern: create tool → export from barrel → register in server.

---

### Check 10: Use Case Exposure

**Why:** Business logic should be accessible via MCP. Unexposed use cases suggest incomplete integration.

| Check | What                            | Rationale                                 |
| ----- | ------------------------------- | ----------------------------------------- |
| 10    | Use cases exposed via MCP tools | Every use case should be callable via MCP |

**LLM Benefit:** LLMs understand that use cases need corresponding MCP tools.

---

### Check 11: Barrel Export Usage

**Why:** The server should import tools from the barrel, not directly from files.

| Check | What                             | Rationale                             |
| ----- | -------------------------------- | ------------------------------------- |
| 11    | Server imports from tool barrels | Consistent with barrel export pattern |

**LLM Benefit:** LLMs see consistent import patterns throughout the codebase.

---

## Test Coverage Requirements

Pre-commit enforces **80% coverage** on all metrics:

| Metric     | Threshold | Rationale                           |
| ---------- | --------- | ----------------------------------- |
| Statements | 80%       | Most code paths should be tested    |
| Branches   | 80%       | Conditional logic should be covered |
| Functions  | 80%       | Public APIs should be tested        |
| Lines      | 80%       | Overall code coverage               |

**LLM Benefit:** High coverage means LLMs have more test examples to learn from when generating new tests.

## ESLint Rules (All Errors)

Code quality rules are enforced as **errors**, not warnings. Warnings get ignored; errors get fixed.

| Rule                                 | Setting                   | Rationale                                                    |
| ------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| `complexity`                         | max 10                    | Complex functions are hard for humans and LLMs to understand |
| `max-depth`                          | max 4                     | Deep nesting indicates code that needs refactoring           |
| `max-lines`                          | max 750                   | Large files should be split into focused modules             |
| `max-lines-per-function`             | max 100                   | Functions should do one thing well                           |
| `max-params`                         | max 4                     | Many parameters suggest the need for an options object       |
| `no-console`                         | error (allow warn, error) | stdout is reserved for MCP protocol communication            |
| `@typescript-eslint/no-explicit-any` | error                     | Type safety is not optional                                  |

**LLM Benefit:** LLMs generate code that fits within these constraints, producing maintainable code by default.

## Architecture Boundaries

ESLint boundary rules enforce layer dependencies at compile time:

| Layer          | Can Import                           | Cannot Import           | Why                                                       |
| -------------- | ------------------------------------ | ----------------------- | --------------------------------------------------------- |
| domain         | domain                               | everything else         | Domain must be pure, no external dependencies             |
| application    | application, domain                  | infrastructure, mcp, di | Use cases orchestrate but don't know about infrastructure |
| infrastructure | infrastructure, application, domain  | mcp, di                 | Adapters implement ports, don't know about MCP            |
| mcp            | mcp, application, di                 | domain, infrastructure  | MCP layer uses use cases via DI, not directly             |
| di             | di, application, infrastructure, mcp | domain                  | DI wires everything together                              |

**Why this matters for LLMs:** When an LLM tries to import `express` in a domain file, ESLint immediately fails. The LLM learns the boundaries from error feedback.

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
  As a user
  I want to create a thing
  So that I can track my things

  Scenario: Successfully create a thing
    Given I have valid thing data
    When I create the thing
    Then the thing should be created
    And I should receive the thing ID
```

### 2. Implement Step Definitions

```typescript
// tests/step-definitions/create-thing.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I have valid thing data', function () {
  this.input = { name: 'Test Thing' };
});

When('I create the thing', async function () {
  const useCase = this.container.resolve(CreateThingUseCase);
  this.result = await useCase.execute(this.input);
});

Then('the thing should be created', function () {
  expect(this.result).to.exist;
});
```

### 3. Implement Inside-Out

Build from the core outward:

1. **Domain** - Entities, value objects, domain errors
2. **Application** - Use cases, ports, schemas
3. **Infrastructure** - Repository implementations, external services
4. **MCP** - Tools that expose use cases

### 4. Run Pre-commit

```bash
npm run pre-commit
```

All checks must pass before committing.

## LLM Development Guides

The generated `CLAUDE.md` and `AGENTS.md` files contain comprehensive guidance for LLMs:

- **Critical rules** - NEVER DO / ALWAYS DO lists
- **Architecture diagrams** - Visual layer structure
- **Code patterns** - Examples of every pattern
- **Error handling** - How to create and handle errors
- **Testing patterns** - Unit and BDD test examples
- **Common errors** - Mistakes and their fixes

These files are automatically loaded by Claude Code and compatible AI coding assistants.

## Requirements

- Node.js 18+
- npm 9+

## License

MIT
