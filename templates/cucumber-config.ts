export function getCucumberConfig(): string {
  return `module.exports = {
  default: {
    requireModule: ['tsx/cjs'],
    require: ['tests/step-definitions/**/*.ts'],
    paths: ['features/**/*.feature'],
    tags: 'not @wip',
    format: ['progress-bar', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
  },
};
`;
}
