module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['tsx'],
    require: ['tests/step-definitions/**/*.ts'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    timeout: 120000, // 2 minutes for npm install operations
    tags: 'not @slow', // Skip slow tests by default (run with --tags @slow explicitly)
  },
  slow: {
    paths: ['features/**/*.feature'],
    requireModule: ['tsx'],
    require: ['tests/step-definitions/**/*.ts'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    timeout: 300000, // 5 minutes for slow tests with npm install
    tags: '@slow',
  },
  all: {
    paths: ['features/**/*.feature'],
    requireModule: ['tsx'],
    require: ['tests/step-definitions/**/*.ts'],
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    timeout: 300000, // 5 minutes for slow tests
  },
};
