Feature: Coverage Thresholds
  As a developer
  I want coverage thresholds set to 80% across all metrics
  So that code quality is consistently enforced

  Scenario: Generator repo has 80% coverage thresholds
    Given the generator vitest.config.ts is loaded
    Then it should have 80% statement threshold
    And it should have 80% branch threshold
    And it should have 80% function threshold
    And it should have 80% line threshold

  Scenario: Generated projects have 80% coverage thresholds
    Given the vitest config template is loaded
    Then the template should have 80% statement threshold
    And the template should have 80% branch threshold
    And the template should have 80% function threshold
    And the template should have 80% line threshold
