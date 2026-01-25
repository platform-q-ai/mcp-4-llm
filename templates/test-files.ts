export function getTestFiles(): Record<string, string> {
  return {
    // Test setup
    'tests/setup.ts': `import 'reflect-metadata';
`,

    // World for Cucumber
    'tests/step-definitions/world.ts': `import { World, setWorldConstructor, Before, After } from '@cucumber/cucumber';
import { container, DependencyContainer } from 'tsyringe';

/**
 * Custom world for BDD tests.
 * Provides isolated DI container and test state management.
 */
export class CustomWorld extends World {
  /** Child DI container for test isolation */
  container!: DependencyContainer;

  /** Input data for the current test */
  input: Record<string, unknown> = {};

  /** Result from the last operation */
  result: unknown = null;

  /** Error from the last operation (if any) */
  error: Error | null = null;

  /** Additional state storage */
  state: Map<string, unknown> = new Map();

  /**
   * Initialize the test world.
   * Creates a child container for isolation.
   */
  async init(): Promise<void> {
    this.container = container.createChildContainer();
    this.input = {};
    this.result = null;
    this.error = null;
    this.state.clear();
  }

  /**
   * Clean up after test.
   */
  async cleanup(): Promise<void> {
    this.container.clearInstances();
  }

  /**
   * Store a value in state
   */
  set<T>(key: string, value: T): void {
    this.state.set(key, value);
  }

  /**
   * Retrieve a value from state
   */
  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }
}

setWorldConstructor(CustomWorld);

Before(async function (this: CustomWorld) {
  await this.init();
});

After(async function (this: CustomWorld) {
  await this.cleanup();
});
`,

    // Example step definitions
    'tests/step-definitions/common.steps.ts': `import { Given, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { CustomWorld } from './world.js';

/**
 * Common step definitions that can be reused across features.
 */

Given('a clean state', async function (this: CustomWorld) {
  this.input = {};
  this.result = null;
  this.error = null;
});

Then('the operation should succeed', async function (this: CustomWorld) {
  expect(this.error).to.be.null;
  expect(this.result).to.exist;
});

Then('I should receive an error', async function (this: CustomWorld) {
  expect(this.error).to.exist;
});

Then('I should receive an error with code {string}', async function (this: CustomWorld, code: string) {
  expect(this.error).to.exist;
  expect((this.error as Error & { code?: string }).code).to.equal(code);
});

Then(
  'the error message should contain {string}',
  async function (this: CustomWorld, message: string) {
    expect(this.error).to.exist;
    expect(this.error!.message).to.include(message);
  }
);

Then(
  'the error should suggest {string}',
  async function (this: CustomWorld, suggestion: string) {
    expect(this.error).to.exist;
    expect((this.error as Error & { suggestedFix?: string }).suggestedFix).to.equal(suggestion);
  }
);
`,

    // Example unit test
    'tests/unit/domain/errors/base.error.test.ts': `import { describe, it, expect } from 'vitest';

import { DomainError, ErrorCategory } from '../../../../src/domain/errors/base.error.js';

// Test implementation of DomainError
class TestError extends DomainError {
  readonly code = 'TEST_ERROR';
  readonly suggestedFix = 'Fix the test';
  readonly isRetryable = false;
  readonly category: ErrorCategory = 'validation';

  constructor(message: string) {
    super(message);
  }
}

describe('DomainError', () => {
  describe('constructor', () => {
    it('should set the error message', () => {
      const error = new TestError('Test message');

      expect(error.message).toBe('Test message');
    });

    it('should set the error name to the class name', () => {
      const error = new TestError('Test message');

      expect(error.name).toBe('TestError');
    });

    it('should be an instance of Error', () => {
      const error = new TestError('Test message');

      expect(error).toBeInstanceOf(Error);
    });

    it('should be an instance of DomainError', () => {
      const error = new TestError('Test message');

      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('toJSON', () => {
    it('should return a structured object', () => {
      const error = new TestError('Test message');

      const json = error.toJSON();

      expect(json).toEqual({
        code: 'TEST_ERROR',
        message: 'Test message',
        suggestedFix: 'Fix the test',
        isRetryable: false,
        category: 'validation',
      });
    });
  });
});
`,

    // Mock example
    'tests/mocks/example.mock.ts': `/**
 * Example mock implementation.
 * Use this pattern for creating test doubles.
 */

// Example interface to mock
// export interface IExampleRepository {
//   findById(id: string): Promise<Example | null>;
//   save(example: Example): Promise<void>;
// }

// Example mock implementation
// export class MockExampleRepository implements IExampleRepository {
//   private items = new Map<string, Example>();
//
//   async findById(id: string): Promise<Example | null> {
//     return this.items.get(id) || null;
//   }
//
//   async save(example: Example): Promise<void> {
//     this.items.set(example.id, example);
//   }
//
//   // Test helpers
//   clear(): void {
//     this.items.clear();
//   }
//
//   getAll(): Example[] {
//     return Array.from(this.items.values());
//   }
// }

export {};
`,
  };
}
