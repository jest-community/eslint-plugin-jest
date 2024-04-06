import { version as typescriptESLintPluginVersion } from '@typescript-eslint/eslint-plugin/package.json';
import { version as eslintVersion } from 'eslint/package.json';
import type { Config } from 'jest';
import * as semver from 'semver';

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

if (semver.major(eslintVersion) >= 9) {
  config.projects = config.projects.filter(
    ({ displayName }) => displayName !== 'lint',
  );

  // jest/unbound-method doesn't work when using @typescript-eslint v6
  if (semver.major(typescriptESLintPluginVersion) === 6) {
    for (const project of config.projects) {
      project.testPathIgnorePatterns.push(
        '<rootDir>/src/rules/__tests__/unbound-method.test.ts',
      );
      project.coveragePathIgnorePatterns.push(
        '<rootDir>/src/rules/unbound-method.ts',
      );
    }
  }
}

export default config;
