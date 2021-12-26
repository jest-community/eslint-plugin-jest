'use strict';

const {
  getRepositories,
  getPathIgnorePattern,
} = require('eslint-remote-tester-repositories');

// eslint-disable-next-line import/no-commonjs
module.exports = {
  repositories: getRepositories({ randomize: true }),
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
  },
};
