import { setWorldConstructor, World } from '@cucumber/cucumber';

export interface GeneratorWorld extends World {
  projectName: string;
  projectPath: string;
  description: string;
  error: Error | null;
  commandOutput: string;
  commandExitCode: number;
}

class CustomWorld extends World implements GeneratorWorld {
  projectName = '';
  projectPath = '';
  description = '';
  error: Error | null = null;
  commandOutput = '';
  commandExitCode = 0;
}

setWorldConstructor(CustomWorld);
