import type { Config } from 'eslint-remote-tester';
import {
  getPathIgnorePattern,
  getRepositories,
} from 'eslint-remote-tester-repositories';

const config: Config = {
  repositories: getRepositories({ randomize: true }).slice(0, 1),
  pathIgnorePattern: getPathIgnorePattern(),
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  concurrentTasks: 3,
  cache: false,
  logLevel: 'info',
  eslintrc: {
    root: true,
    env: {
      es6: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    extends: ['plugin:jest/all'],
    rules: {
      // this requires type information, which is not really feasible when
      // linting a bunch of randomly picked open-source js & ts projects
      'jest/unbound-method': 'off',
    },
  },
};

export default config;
