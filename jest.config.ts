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

if (semver.major(eslintVersion) !== 8) {
  // our eslint config only works for v8
  config.projects = config.projects.filter(
    ({ displayName }) => displayName !== 'lint',
  );
}

export default config;
