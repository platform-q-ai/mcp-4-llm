Feature: ESLint Errors Only Configuration
  As a developer
  I want all ESLint rules to be errors not warnings
  So that quality issues block commits rather than being ignored

  Scenario: Generator ESLint config uses errors not warnings
    Given the generator eslint.config.js is loaded
    Then it should not have warn rules for complexity
    And it should not have warn rules for max-depth
    And it should not have warn rules for max-lines-per-function
    And it should not have warn rules for max-params

  Scenario: Generated projects use errors not warnings for code quality rules
    Given the eslint config template is loaded
    Then the template should use error for complexity rule
    And the template should use error for max-depth rule
    And the template should use error for max-lines rule
    And the template should use error for max-lines-per-function rule
    And the template should use error for max-params rule
