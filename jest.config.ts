import fs from 'fs';
import type { Config } from 'jest';
import * as semver from 'semver';

const { version: typescriptESLintPluginVersion } = JSON.parse(
  fs.readFileSync(
    'node_modules/@typescript-eslint/eslint-plugin/package.json',
    'utf-8',
  ),
);

const { version: eslintVersion } = JSON.parse(
  fs.readFileSync('node_modules/eslint/package.json', 'utf-8'),
);

const config = {
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  projects: [
    {
      displayName: 'test',
      testPathIgnorePatterns: [
        '<rootDir>/lib/.*',
        '<rootDir>/src/rules/__tests__/fixtures/*',
        '<rootDir>/src/rules/__tests__/test-utils.ts',
      ],
      coveragePathIgnorePatterns: ['/node_modules/'],
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*.{js,ts}'],
      testPathIgnorePatterns: ['<rootDir>/lib/.*'],
      coveragePathIgnorePatterns: ['/node_modules/'],
    },
  ],
} satisfies Config;

if (semver.major(eslintVersion) !== 8) {
  // our eslint config only works for v8
  config.projects = config.projects.filter(
    ({ displayName }) => displayName !== 'lint',
  );
}

// jest/unbound-method seems to only be happy with @typescript-eslint v7 right now...
if (semver.major(typescriptESLintPluginVersion) !== 7) {
  for (const project of config.projects) {
    project.testPathIgnorePatterns.push(
      '<rootDir>/src/rules/__tests__/unbound-method.test.ts',
    );
    project.coveragePathIgnorePatterns.push(
      '<rootDir>/src/rules/unbound-method.ts',
    );
  }
}

export default config;
