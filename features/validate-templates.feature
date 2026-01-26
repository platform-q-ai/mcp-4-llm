Feature: Validate Template Output
  As a generator developer
  I want all templates to produce valid output
  So that generated projects work correctly

  # ============================================
  # Template-based validation (fast)
  # ============================================

  Scenario: package.json template produces valid JSON with required scripts
    Given the package.json template is loaded with name "test-project" and description "Test"
    Then the package.json output should be valid JSON
    And the package.json output should have script "build"
    And the package.json output should have script "test"
    And the package.json output should have script "lint"
    And the package.json output should have script "format"
    And the package.json output should have script "typecheck"
    And the package.json output should have script "pre-commit"
    And the package.json output should have MCP SDK dependency

  Scenario: ESLint config template produces valid output
    Given the eslint config template is loaded for validation
    Then the eslint config should contain "export default"
    And the eslint config should configure boundaries plugin

  Scenario: Vitest config template has coverage thresholds
    Given the vitest config template is loaded for validation
    Then the vitest config should have 80% coverage thresholds

  Scenario: Source files template has barrel exports
    Given the source files template is loaded with name "test-project"
    Then the source files should include domain index.ts
    And the source files should include application index.ts
    And the source files should include infrastructure index.ts

  Scenario: MCP server template imports SDK
    Given the source files template is loaded with name "test-project"
    Then the server.ts should import McpServer from SDK

  Scenario: CLAUDE.md and AGENTS.md templates are identical
    Given the documentation templates are loaded with name "test-project"
    Then CLAUDE.md and AGENTS.md should have identical content

  # ============================================
  # Full generation tests (slow - requires npm install)
  # ============================================

  @slow
  Scenario: Generated project has executable scripts
    Given a clean test environment
    And I have generated and installed a project named "hook-test"
    Then .husky/pre-commit should be executable
    And scripts/check-code-quality.sh should be executable
