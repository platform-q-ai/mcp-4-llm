Feature: Code Quality Checks
  As a developer
  I want comprehensive code quality checks in generated projects
  So that common issues are caught before commit

  Background:
    Given the code quality script template is loaded

  # ============================================
  # CHECK 1: Incomplete Work Markers
  # ============================================

  Scenario: Check 1a - TODO/FIXME/HACK markers in source
    Then the script should check for TODO in src
    And the script should check for FIXME in src
    And the script should check for XXX in src
    And the script should check for HACK in src
    And the script should check for BUG in src

  Scenario: Check 1b - Placeholder text in source
    Then the script should check for "not implemented" in src
    And the script should check for "implement this" in src
    And the script should check for "placeholder" in src

  Scenario: Check 1c - Test code in production
    Then the script should check for "mock" in src
    And the script should check for "fake" in src
    And the script should check for "dummy" in src

  Scenario: Check 1d - Focused/skipped tests in source
    Then the script should check for ".only(" pattern
    And the script should check for ".skip(" pattern

  # ============================================
  # CHECK 2: Type Safety and Lint Bypasses
  # ============================================

  Scenario: Check 2a - Type safety bypasses
    Then the script should check for "as any" in src

  Scenario: Check 2b - TypeScript suppressions
    Then the script should check for "@ts-ignore" in src
    And the script should check for "@ts-expect-error" in src

  Scenario: Check 2c - Linting bypasses
    Then the script should check for "eslint-disable" in src

  Scenario: Check 2d - TODO in tests
    Then the script should check for TODO in tests
    And the script should check for FIXME in tests
    And the script should check for XXX in tests
    And the script should check for HACK in tests

  Scenario: Check 2e - Stub implementations
    Then the script should check for stub implementations with "throw new Error"

  Scenario: Check 2f - Console.log in source
    Then the script should check for "console.log" in src

  # ============================================
  # CHECK 3: Barrel Exports
  # ============================================

  Scenario: Check 3 - Barrel exports exist for all layers
    Then the script should check domain has index.ts
    And the script should check application has index.ts
    And the script should check infrastructure has index.ts
    And the script should check mcp has index.ts
    And the script should check di has index.ts

  # ============================================
  # CHECK 4: Zod Validation
  # ============================================

  Scenario: Check 4 - Zod validation in use cases
    Then the script should check for Zod parse usage in use cases
    And the script should check use-cases for .parse or .safeParse

  # ============================================
  # CHECK 5: Domain Error Structure
  # ============================================

  Scenario: Check 5a - Domain error base structure
    Then the script should check base.error.ts has abstract code
    And the script should check base.error.ts has abstract suggestedFix
    And the script should check base.error.ts has abstract isRetryable
    And the script should check base.error.ts has abstract category

  Scenario: Check 5b - Domain error implementations
    Then the script should check domain errors have code property
    And the script should check domain errors have suggestedFix property
    And the script should check domain errors have isRetryable property
    And the script should check domain errors have category property

  # ============================================
  # CHECK 6: BDD Feature Coverage
  # ============================================

  Scenario: Check 6a - Features directory exists
    Then the script should check features directory exists

  Scenario: Check 6b - Feature files exist
    Then the script should check features directory is not empty

  Scenario: Check 6c - Feature files have scenarios
    Then the script should check feature files have Scenario definitions

  Scenario: Check 6d - Step definitions exist
    Then the script should check step-definitions has .steps.ts files

  Scenario: Check 6e - Use cases have feature coverage
    Then the script should check use cases are covered by features

  Scenario: Check 6f - Minimum scenario count
    Then the script should check minimum scenario count

  # ============================================
  # CHECK 7: Value Object Error Types
  # ============================================

  Scenario: Check 7 - Value objects throw domain errors
    Then the script should check value objects throw DomainError

  # ============================================
  # CHECK 8: MCP Tool Error Handling
  # ============================================

  Scenario: Check 8 - MCP tools have error handling
    Then the script should check MCP tools have try-catch blocks
    And the script should check MCP tools return structured errors

  # ============================================
  # CHECK 9: MCP Tools Registered
  # ============================================

  Scenario: Check 9 - MCP tools registered in server
    Then the script should check tools are imported in server.ts
    And the script should check tools are resolved from container

  # ============================================
  # CHECK 10: Use Cases Exposed via MCP
  # ============================================

  Scenario: Check 10 - Use cases exposed via MCP tools
    Then the script should check use cases are used by MCP tools

  # ============================================
  # CHECK 11: Barrel Exports Registered
  # ============================================

  Scenario: Check 11 - Tool barrel exports are used
    Then the script should check tool exports are resolved in server
