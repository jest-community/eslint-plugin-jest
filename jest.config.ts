import type { Config } from '@jest/types';

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

export default config;
