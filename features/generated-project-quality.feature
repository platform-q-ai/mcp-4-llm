Feature: Generated Project Quality
  As a developer
  I want generated projects to pass all quality checks
  So that I can start development with a clean slate

  Background:
    Given a clean test environment

  @slow
  Scenario: Generated project passes typecheck
    Given I have generated and installed a project named "typecheck-test"
    When I run typecheck in the generated project
    Then the command should succeed

  @slow
  Scenario: Generated project passes lint
    Given I have generated and installed a project named "lint-test"
    When I run lint in the generated project
    Then the command should succeed

  @slow
  Scenario: Generated project passes format check
    Given I have generated and installed a project named "format-test"
    When I run format check in the generated project
    Then the command should succeed

  @slow
  Scenario: Generated project passes unit tests
    Given I have generated and installed a project named "test-test"
    When I run unit tests in the generated project
    Then the command should succeed

  @slow
  Scenario: Generated project builds successfully
    Given I have generated and installed a project named "build-test"
    When I run build in the generated project
    Then the command should succeed
    And dist directory should exist

  @slow
  Scenario: Generated project passes code quality checks
    Given I have generated and installed a project named "quality-test"
    When I run code quality check in the generated project
    Then the command should succeed
