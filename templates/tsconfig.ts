export function getTsConfig(): string {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['src/**/*.ts'],
    exclude: ['node_modules', 'dist'],
  };

  return JSON.stringify(config, null, 2);
}

export function getTsConfigEslint(): string {
  const config = {
    extends: './tsconfig.json',
    include: ['src/**/*.ts', 'tests/**/*.ts'],
    exclude: ['node_modules', 'dist'],
  };

  return JSON.stringify(config, null, 2);
}

export function getTsConfigTest(): string {
  const config = {
    extends: './tsconfig.json',
    compilerOptions: {
      rootDir: '.',
    },
    include: ['src/**/*.ts', 'tests/**/*.ts'],
    exclude: ['node_modules', 'dist'],
  };

  return JSON.stringify(config, null, 2);
}
