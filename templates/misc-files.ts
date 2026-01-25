export function getMiscFiles(): {
  gitignore: string;
  envExample: string;
  conventions: string;
  troubleshooting: string;
  exampleFeature: string;
} {
  return {
    gitignore: `# Dependencies
node_modules/

# Build output
dist/

# Test output
coverage/
reports/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Misc
*.tgz
.cache/
`,

    envExample: `# ============================================
# Environment Configuration
# ============================================
# Copy this file to .env and fill in the values

# Node environment
NODE_ENV=development

# Add your environment variables below
# Example:
# DATABASE_URL=sqlite:./data/app.db
# API_KEY=your-api-key-here
`,

    conventions: `# Conventions

This document describes the coding conventions for this project.

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Entity | \`{name}.entity.ts\` | \`user.entity.ts\` |
| Value Object | \`{name}.vo.ts\` | \`email-address.vo.ts\` |
| Use Case | \`{verb}-{noun}.use-case.ts\` | \`create-user.use-case.ts\` |
| Port Interface | \`{name}.port.ts\` | \`user-repository.port.ts\` |
| Repository Impl | \`{adapter}-{name}.repository.ts\` | \`sqlite-user.repository.ts\` |
| Domain Error | \`{name}.errors.ts\` | \`user.errors.ts\` |
| Schema | \`{name}.schema.ts\` | \`create-user.schema.ts\` |
| MCP Tool | \`{name}.tool.ts\` | \`create-user.tool.ts\` |
| Unit Test | \`{name}.test.ts\` | \`user.entity.test.ts\` |
| Step Definitions | \`{feature}.steps.ts\` | \`user.steps.ts\` |
| Feature File | \`{feature}.feature\` | \`user-management.feature\` |

## Class Naming

| Type | Pattern | Example |
|------|---------|---------|
| Entity | \`{Name}\` | \`User\` |
| Value Object | \`{Name}\` | \`EmailAddress\` |
| Use Case | \`{Verb}{Noun}UseCase\` | \`CreateUserUseCase\` |
| Port Interface | \`I{Name}\` | \`IUserRepository\` |
| Repository | \`{Adapter}{Name}Repository\` | \`SqliteUserRepository\` |
| Domain Error | \`{Description}Error\` | \`UserNotFoundError\` |
| MCP Tool | \`{Name}Tool\` | \`CreateUserTool\` |

## DI Tokens

Format: \`{NAME}_{TYPE}_TOKEN\`

Examples:
- \`USER_REPOSITORY_TOKEN\`
- \`EMAIL_SERVICE_TOKEN\`
- \`CONFIG_TOKEN\`

## Error Codes

Format: \`{ENTITY}_{DESCRIPTION}\`

Examples:
- \`USER_NOT_FOUND\`
- \`USER_NAME_REQUIRED\`
- \`USER_EMAIL_INVALID\`
- \`USER_ALREADY_EXISTS\`

## Commit Messages

Follow conventional commits:

- \`feat:\` New feature
- \`fix:\` Bug fix
- \`refactor:\` Code refactoring
- \`test:\` Adding or updating tests
- \`docs:\` Documentation changes
- \`chore:\` Maintenance tasks

Examples:
- \`feat: add user creation use case\`
- \`fix: handle empty email in validation\`
- \`test: add BDD scenarios for user deletion\`
`,

    troubleshooting: `# Troubleshooting

Common issues and their solutions.

## Lint Errors

### \`boundaries/element-types\` violation

\`\`\`
Error: "domain" is not allowed to import "infrastructure"
\`\`\`

**Cause:** You tried to import infrastructure code directly in the domain layer.

**Fix:** Domain should never import from infrastructure. Use a port interface:

1. Define the interface in \`src/application/ports/\`
2. Implement the interface in \`src/infrastructure/\`
3. Register the implementation in \`src/di/container.ts\`
4. Inject the interface in your use case

### \`boundaries/external\` violation

\`\`\`
Error: Domain layer must have no external dependencies
\`\`\`

**Cause:** You imported an npm package in the domain layer.

**Fix:** Domain layer must be pure TypeScript. Move external dependencies to:
- Infrastructure layer for adapters
- Application layer for validation (Zod is allowed there)

### \`boundaries/entry-point\` violation

\`\`\`
Error: Import from index.ts barrel file instead of internal files
\`\`\`

**Cause:** You imported directly from an internal file instead of the barrel export.

**Fix:** 
\`\`\`typescript
// ❌ Wrong
import { User } from '../domain/entities/user.entity';

// ✅ Correct
import { User } from '../domain';
\`\`\`

Make sure the entity is exported from \`src/domain/index.ts\`.

### \`@typescript-eslint/no-explicit-any\`

\`\`\`
Error: Unexpected any. Specify a different type.
\`\`\`

**Fix:** Define a proper type:
- For domain concepts, create a value object in \`src/domain/value-objects/\`
- For input validation, create a Zod schema in \`src/application/schemas/\`
- For external data, create an interface in the appropriate layer

## Build Errors

### \`Cannot find module\`

**Cause:** Missing \`.js\` extension in imports.

**Fix:** Add \`.js\` extension to all relative imports:
\`\`\`typescript
// ❌ Wrong
import { User } from './user.entity';

// ✅ Correct
import { User } from './user.entity.js';
\`\`\`

### Decorator errors

**Cause:** Missing \`reflect-metadata\` import or tsconfig settings.

**Fix:** 
1. Ensure \`reflect-metadata\` is imported at the entry point
2. Check \`tsconfig.json\` has:
   \`\`\`json
   {
     "experimentalDecorators": true,
     "emitDecoratorMetadata": true
   }
   \`\`\`

## Test Errors

### \`Cannot resolve dependency\`

**Cause:** Dependency not registered in DI container.

**Fix:** Register the dependency in \`src/di/container.ts\`:
\`\`\`typescript
container.registerSingleton(TOKEN, Implementation);
\`\`\`

### Coverage threshold not met

**Cause:** Test coverage below 80%.

**Fix:** Add more tests. Check coverage report:
\`\`\`bash
npm run test:coverage
\`\`\`

Look at \`coverage/index.html\` for detailed report.

## Pre-commit Hook Failures

### Code quality check failed

**Cause:** Found TODOs, FIXMEs, or other markers.

**Fix:** 
- Complete the TODO or remove it
- If tracking is needed, create a GitHub issue instead

### Formatting check failed

**Fix:** Run \`npm run format\` to auto-fix.

## MCP Server Issues

### Server not starting

**Cause:** Likely a missing dependency or configuration error.

**Fix:** 
1. Check that all dependencies are installed: \`npm install\`
2. Verify the entry point compiles: \`npm run build\`
3. Check for errors in server setup

### Tool not responding

**Cause:** Error in tool execution not being caught.

**Fix:** Ensure all tools have proper error handling:
\`\`\`typescript
async execute(args: unknown): Promise<ToolResult> {
  try {
    // ... logic
  } catch (error) {
    return errorResult(error);
  }
}
\`\`\`
`,

    exampleFeature: `@wip
Feature: Example Feature
  As a developer
  I want to have an example feature file
  So that I can understand the BDD structure

  # This feature is marked @wip and will be skipped until implemented.
  # Remove @wip tag once you implement the step definitions.

  Background:
    Given a clean state

  Scenario: Example successful scenario
    # Implement these steps in tests/step-definitions/example.steps.ts
    Given I have valid input data
    When I perform the operation
    Then the operation should succeed

  Scenario: Example error scenario
    Given I have invalid input data
    When I perform the operation
    Then I should receive an error
`,
  };
}
