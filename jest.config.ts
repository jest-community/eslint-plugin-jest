import type { Config } from '@jest/types';
import { version as eslintVersion } from 'eslint/package.json';
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
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*.{js,ts}'],
      testPathIgnorePatterns: ['<rootDir>/lib/.*'],
    },
  ],
} satisfies Config.InitialOptions;

if (semver.major(eslintVersion) >= 9) {
  config.projects = config.projects.filter(
    ({ displayName }) => displayName !== 'lint',
  );
}

export default config;
