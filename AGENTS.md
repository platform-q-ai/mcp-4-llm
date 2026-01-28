# create-open-mcp - AI Agent Development Guide

> This file provides comprehensive guidance for AI agents working on this generator codebase.
> It is automatically loaded by Claude Code and compatible AI coding assistants.

## Project Overview

**create-open-mcp** is a CLI scaffolding tool that generates LLM-ready MCP (Model Context Protocol) server projects. This generator must follow the same quality standards it enforces on generated projects.

## Critical Rules

### NEVER DO

1. **Never commit without running `npm run pre-commit`** - all quality gates must pass
2. **Never use `any` type** - use proper types or `unknown` (checked: `as any`)
3. **Never leave TODO/FIXME/XXX/HACK/BUG comments** - complete the work or create an issue
4. **Never use `@ts-ignore` or `@ts-expect-error`** - fix the type error instead
5. **Never use `eslint-disable` comments** - fix the lint error instead
6. **Never leave stub implementations** - no `throw new Error('not implemented')`
7. **Never use `.only()` or `.skip()` in tests** - all tests must run
8. **Never bypass pre-commit hooks** with `--no-verify`
9. **Never modify templates without updating tests**
10. **Never add dependencies without justification** - this is a scaffolding tool, keep it lean

### ALWAYS DO

1. **Always write BDD feature first** before implementing new generator functionality
2. **Always test generated output** - ensure templates produce valid, working code
3. **Always run `npm run pre-commit` before committing**
4. **Always maintain 80% test coverage**
5. **Always update feature files when changing generator behavior**
6. **Always validate that generated projects pass their own pre-commit**

## Architecture

### Project Structure

```
create-open-mcp/
├── create-open-mcp.ts          # Main generator entry point
├── templates/                   # Template modules
│   ├── package-json.ts         # Generated package.json
│   ├── tsconfig.ts             # TypeScript configurations
│   ├── eslint-config.ts        # ESLint with boundaries
│   ├── vitest-config.ts        # Test configuration
│   ├── cucumber-config.ts      # BDD configuration
│   ├── prettier-config.ts      # Formatting rules
│   ├── agents-md.ts            # LLM development guide
│   ├── claude-md.ts            # Claude-specific guide
│   ├── code-quality-script.ts  # Pre-commit checks
│   ├── source-files.ts         # Generated source code
│   ├── test-files.ts           # Generated test setup
│   └── misc-files.ts           # Gitignore, conventions, etc.
├── tests/
│   ├── unit/                   # Unit tests for templates
│   │   └── templates/          # Template output validation
│   └── step-definitions/       # BDD step implementations
├── features/                   # BDD feature files
│   ├── generate-project.feature
│   ├── validate-templates.feature
│   ├── code-quality-checks.feature
│   ├── coverage-thresholds.feature
│   ├── eslint-errors-only.feature
│   └── generated-project-quality.feature
├── scripts/
│   └── check-code-quality.sh   # Quality gate script
└── [config files]
```

### Template Responsibilities

| Template File      | Generates              | Critical Checks               |
| ------------------ | ---------------------- | ----------------------------- |
| `package-json.ts`  | package.json with deps | Valid JSON, latest versions   |
| `eslint-config.ts` | ESLint boundary rules  | Correct layer restrictions    |
| `vitest-config.ts` | Coverage thresholds    | 80% minimum coverage          |
| `source-files.ts`  | Domain/App/Infra/MCP   | Clean Architecture compliance |
| `test-files.ts`    | Test setup, mocks      | Working test infrastructure   |
| `agents-md.ts`     | LLM development guide  | Accurate examples             |

## BDD Development Workflow (Red-Green-Refactor)

This project follows strict **Red-Green-Refactor** TDD/BDD practices. Every feature must go through this cycle:

1. **RED**: Write failing tests first (both BDD feature tests AND unit tests)
2. **GREEN**: Write minimal code to make tests pass
3. **REFACTOR**: Clean up while keeping tests green

### Phase 1: RED - Write Failing Feature Tests

#### Step 1.1: Write Feature File

```gherkin
# features/generate-project.feature
Feature: Generate MCP Project
  As a developer
  I want to generate a new MCP project
  So that I can quickly start building MCP servers

  Scenario: Generate project with valid name
    Given I want to create a project named "test-project"
    When I run the generator
    Then a directory "test-project" should be created
    And it should contain a valid package.json
    And it should have the correct directory structure
    And running npm install should succeed

  Scenario: Reject invalid project name
    Given I want to create a project named "Test Project"
    When I run the generator
    Then I should receive an error about invalid project name
    And no directory should be created

  Scenario: Generated project passes pre-commit
    Given I have generated a project named "test-project"
    And npm install has completed
    When I run pre-commit in the generated project
    Then all quality checks should pass
```

#### Step 1.2: Implement Step Definitions

```typescript
// tests/step-definitions/generate-project.steps.ts
import { Given, When, Then, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { execSync } from 'child_process';
import { existsSync, rmSync, readFileSync } from 'fs';
import path from 'path';

import { GeneratorWorld } from './world';

const TEST_DIR = path.join(process.cwd(), '.test-output');

After(async function (this: GeneratorWorld) {
  // Cleanup generated test projects
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

Given('I want to create a project named {string}', function (this: GeneratorWorld, name: string) {
  this.projectName = name;
  this.projectPath = path.join(TEST_DIR, name);
});

When('I run the generator', async function (this: GeneratorWorld) {
  try {
    execSync(`npx tsx create-open-mcp.ts ${this.projectName}`, {
      cwd: process.cwd(),
      env: { ...process.env, TEST_OUTPUT_DIR: TEST_DIR },
      stdio: 'pipe',
    });
    this.error = null;
  } catch (error) {
    this.error = error as Error;
  }
});

Then('a directory {string} should be created', function (this: GeneratorWorld, name: string) {
  expect(existsSync(path.join(TEST_DIR, name))).to.be.true;
});

Then('it should contain a valid package.json', function (this: GeneratorWorld) {
  const pkgPath = path.join(this.projectPath, 'package.json');
  expect(existsSync(pkgPath)).to.be.true;

  const content = readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);

  expect(pkg.name).to.equal(this.projectName);
  expect(pkg.scripts).to.have.property('build');
  expect(pkg.scripts).to.have.property('test');
  expect(pkg.scripts).to.have.property('pre-commit');
});
```

#### Step 1.3: Verify Feature Tests FAIL (RED)

```bash
npm run test:features
# Expected: Tests should FAIL because the feature is not implemented yet
# This confirms your tests are actually testing something
```

**CRITICAL**: If tests pass at this stage, your tests are not testing the right thing!

### Phase 2: RED - Write Failing Unit Tests

#### Step 2.1: Write Unit Tests for Templates

```typescript
// tests/unit/templates/new-template.test.ts
import { describe, it, expect } from 'vitest';

import { getNewTemplate } from '../../../templates/new-template';

describe('new-template', () => {
  it('should generate valid output', () => {
    const result = getNewTemplate('test-project');

    expect(result).toContain('test-project');
  });

  it('should handle edge cases', () => {
    const result = getNewTemplate('my-project');

    expect(result).toBeDefined();
  });
});
```

#### Step 2.2: Verify Unit Tests FAIL (RED)

```bash
npm run test:unit
# Expected: Tests should FAIL because the template doesn't exist yet
# You may see: "Cannot find module '../../../templates/new-template'"
```

**CRITICAL**: Both BDD tests AND unit tests must be RED before proceeding!

### Phase 3: GREEN - Implement to Make Tests Pass

#### Step 3.1: Implement Template/Generator Code

Now write the minimal code needed to make tests pass:

```typescript
// templates/new-template.ts
export function getNewTemplate(name: string): string {
  return `// Generated for ${name}`;
}
```

#### Step 3.2: Verify Unit Tests PASS (GREEN)

```bash
npm run test:unit
# Expected: Unit tests should now PASS
```

#### Step 3.3: Verify Feature Tests PASS (GREEN)

```bash
npm run test:features
# Expected: BDD tests should now PASS
```

#### Step 3.4: Verify All Quality Gates PASS

```bash
npm run pre-commit
# Expected: All checks pass (lint, typecheck, coverage, etc.)
```

### Phase 4: REFACTOR - Clean Up While Green

#### Step 4.1: Improve Code Quality

- Extract helper functions
- Improve naming
- Add documentation
- Optimize performance

#### Step 4.2: Verify Tests Still PASS

```bash
npm run test
npm run pre-commit
# Expected: All tests still pass after refactoring
```

### Summary: Red-Green-Refactor Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    RED-GREEN-REFACTOR CYCLE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐     ┌─────────┐     ┌───────────┐                 │
│  │   RED   │────▶│  GREEN  │────▶│  REFACTOR │──┐              │
│  └─────────┘     └─────────┘     └───────────┘  │              │
│       ▲                                          │              │
│       └──────────────────────────────────────────┘              │
│                                                                  │
│  RED:      1. Write feature file                                │
│            2. Write step definitions                            │
│            3. Run tests → MUST FAIL                             │
│            4. Write unit tests                                  │
│            5. Run tests → MUST FAIL                             │
│                                                                  │
│  GREEN:    6. Implement minimal code                            │
│            7. Run tests → MUST PASS                             │
│            8. Run pre-commit → MUST PASS                        │
│                                                                  │
│  REFACTOR: 9. Improve code quality                              │
│            10. Run tests → MUST STILL PASS                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Patterns

### Unit Tests for Templates

```typescript
// tests/unit/templates/package-json.test.ts
import { describe, it, expect } from 'vitest';

import { getPackageJson } from '../../../templates/package-json';

describe('package-json template', () => {
  it('should generate valid JSON', async () => {
    const result = await getPackageJson('test-project', 'Test description');

    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('should include project name', async () => {
    const result = await getPackageJson('my-service', 'My service');
    const pkg = JSON.parse(result);

    expect(pkg.name).toBe('my-service');
  });

  it('should include required scripts', async () => {
    const result = await getPackageJson('test', 'Test');
    const pkg = JSON.parse(result);

    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('test');
    expect(pkg.scripts).toHaveProperty('pre-commit');
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('typecheck');
  });

  it('should include MCP SDK dependency', async () => {
    const result = await getPackageJson('test', 'Test');
    const pkg = JSON.parse(result);

    expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
  });
});
```

### Integration Tests for Generated Projects

```typescript
// tests/unit/templates/generated-project.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

describe('Generated Project Integration', () => {
  const testProjectPath = path.join(process.cwd(), '.test-generated');

  beforeAll(() => {
    // Generate a test project
    execSync(`npx tsx create-open-mcp.ts test-generated --description "Test project"`, {
      stdio: 'pipe',
    });
  }, 120000); // 2 minute timeout for npm install

  afterAll(() => {
    if (existsSync(testProjectPath)) {
      rmSync(testProjectPath, { recursive: true, force: true });
    }
  });

  it('should have correct directory structure', () => {
    expect(existsSync(path.join(testProjectPath, 'src/domain'))).toBe(true);
    expect(existsSync(path.join(testProjectPath, 'src/application'))).toBe(true);
    expect(existsSync(path.join(testProjectPath, 'src/infrastructure'))).toBe(true);
    expect(existsSync(path.join(testProjectPath, 'src/mcp'))).toBe(true);
  });

  it('should pass typecheck', () => {
    expect(() => {
      execSync('npm run typecheck', { cwd: testProjectPath, stdio: 'pipe' });
    }).not.toThrow();
  });

  it('should pass lint', () => {
    expect(() => {
      execSync('npm run lint', { cwd: testProjectPath, stdio: 'pipe' });
    }).not.toThrow();
  });

  it('should pass tests', () => {
    expect(() => {
      execSync('npm run test', { cwd: testProjectPath, stdio: 'pipe' });
    }).not.toThrow();
  });
});
```

## Error Handling

### Generator Errors

Errors should be clear and actionable:

```typescript
// Good error message
if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error(
    'Error: Project name must start with a letter and contain only lowercase letters, numbers, and hyphens'
  );
  console.error('Example: my-mcp-server');
  process.exit(1);
}

// Bad error message
if (!isValidName(name)) {
  throw new Error('Invalid name');
}
```

## Template Guidelines

### Template Function Pattern

All templates follow this pattern:

```typescript
// templates/example.ts
export function getExampleConfig(name: string, options?: Options): string {
  return `{
  "name": "${name}",
  "setting": ${options?.setting ?? 'default'}
}`;
}
```

### Template Testing

Every template function must have corresponding tests:

1. Valid output (parseable JSON/valid syntax)
2. Correct variable substitution
3. All required fields present
4. Edge cases (empty strings, special characters)

## Pre-commit Checks

The pre-commit hook runs these checks in order:

| Order | Check        | Command                      | Purpose                    |
| ----- | ------------ | ---------------------------- | -------------------------- |
| 1     | Code quality | `npm run check:code-quality` | No TODOs, stubs, etc.      |
| 2     | Lint         | `npm run lint`               | ESLint rules               |
| 3     | Format       | `npm run format:check`       | Prettier formatting        |
| 4     | Typecheck    | `npm run typecheck`          | TypeScript errors          |
| 5     | Build        | `npm run build`              | Compilation                |
| 6     | Coverage     | `npm run test:coverage`      | Unit tests + 80% threshold |

Note: BDD tests (`npm run test:features`) are run separately as they exclude `@slow` tests by default.
To run all tests including slow integration tests: `npm run test:features:all`

## Commands Reference

| Command                      | Description                       |
| ---------------------------- | --------------------------------- |
| `npm run build`              | Compile TypeScript                |
| `npm run generate`           | Run generator (development)       |
| `npm run test:generate`      | Generate and cleanup test project |
| `npm run test`               | Run all tests                     |
| `npm run test:unit`          | Run unit tests only               |
| `npm run test:features`      | Run BDD tests only                |
| `npm run test:coverage`      | Run with coverage report          |
| `npm run lint`               | Check for ESLint issues           |
| `npm run lint:fix`           | Auto-fix ESLint issues            |
| `npm run format`             | Format with Prettier              |
| `npm run format:check`       | Check formatting                  |
| `npm run typecheck`          | Check TypeScript types            |
| `npm run check:code-quality` | Check for TODOs, stubs            |
| `npm run pre-commit`         | Full quality gate                 |

## Checklist Before Committing

- [ ] All tests pass (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format:check`)
- [ ] Types are correct (`npm run typecheck`)
- [ ] No TODOs or FIXMEs in code
- [ ] Coverage thresholds met (80%)
- [ ] Feature files exist for new functionality
- [ ] Template tests verify output validity
- [ ] Generated projects still pass their own pre-commit

## Common Tasks

### Adding a New Template

1. Create feature file describing the template behavior
2. Create template file in `templates/`
3. Add unit tests in `tests/unit/templates/`
4. Import and use in `create-open-mcp.ts`
5. Update integration tests if needed

### Modifying Existing Templates

1. Update feature file if behavior changes
2. Modify template
3. Update unit tests
4. Run integration tests to verify generated projects still work
5. Consider backward compatibility

### Adding a CLI Option

1. Write feature file for the option
2. Add argument parsing in `create-open-mcp.ts`
3. Pass option to relevant template functions
4. Add tests for the option
5. Update README.md

## Troubleshooting

### Generated Project Fails Pre-commit

1. Check template syntax for errors
2. Verify ESLint config generates valid JS
3. Check import paths in source-files.ts
4. Ensure all barrel exports are correct

### Template Output Invalid

1. Run template function in isolation
2. Check for unescaped special characters
3. Verify JSON validity with JSON.parse()
4. Check for template literal issues (backticks, ${})

### Tests Timeout

1. Integration tests need 120s+ for npm install
2. Use `--timeout` flag for Cucumber
3. Consider mocking npm install for unit tests
