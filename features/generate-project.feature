Feature: Generate MCP Project
  As a developer
  I want to generate a new MCP project with Clean Architecture
  So that I can quickly start building LLM-ready MCP servers

  Background:
    Given a clean test environment

  Scenario: Generate project with valid name
    Given I want to create a project named "test-mcp-server"
    And the description "A test MCP server"
    When I run the generator
    Then a directory "test-mcp-server" should be created
    And it should contain a valid package.json
    And the package.json name should be "test-mcp-server"
    And the package.json description should be "A test MCP server"

  Scenario: Generate project creates correct directory structure
    Given I want to create a project named "test-structure"
    When I run the generator
    Then the following directories should exist:
      | directory                     |
      | src/domain/entities           |
      | src/domain/value-objects      |
      | src/domain/errors             |
      | src/application/use-cases     |
      | src/application/ports         |
      | src/application/schemas       |
      | src/infrastructure            |
      | src/mcp/tools                 |
      | src/di                        |
      | tests/unit                    |
      | tests/step-definitions        |
      | tests/mocks                   |
      | features                      |
      | scripts                       |

  Scenario: Generated project has all required config files
    Given I want to create a project named "test-configs"
    When I run the generator
    Then the following files should exist:
      | file                    |
      | package.json            |
      | tsconfig.json           |
      | eslint.config.js        |
      | vitest.config.ts        |
      | cucumber.cjs            |
      | .prettierrc             |
      | .gitignore              |
      | CLAUDE.md               |
      | AGENTS.md               |
      | CONVENTIONS.md          |
      | scripts/check-code-quality.sh |
      | .husky/pre-commit       |

  Scenario: Reject project name starting with uppercase
    Given I want to create a project named "TestProject"
    When I run the generator
    Then the generator should fail
    And the error should mention "lowercase"

  Scenario: Reject project name with spaces
    Given I want to create a project named "test project"
    When I run the generator
    Then the generator should fail

  Scenario: Reject project name starting with number
    Given I want to create a project named "123project"
    When I run the generator
    Then the generator should fail

  Scenario: Accept project name with hyphens
    Given I want to create a project named "my-test-project"
    When I run the generator
    Then a directory "my-test-project" should be created
    And it should contain a valid package.json

  Scenario: Accept project name with numbers
    Given I want to create a project named "project123"
    When I run the generator
    Then a directory "project123" should be created
