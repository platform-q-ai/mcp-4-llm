export function getPrettierConfig(): string {
  const config = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    arrowParens: 'always',
  };

  return JSON.stringify(config, null, 2);
}
