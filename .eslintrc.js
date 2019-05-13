'use strict';

const { globals } = require('./').environments.globals;

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:eslint-plugin/recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier',
  ],
  plugins: ['eslint-plugin', 'node', 'prettier', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    eqeqeq: ['error', 'smart'],
    strict: 'error',
    'prefer-template': 'warn',
    'object-shorthand': ['warn', 'always', { avoidExplicitReturnArrows: true }],
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: true,
          object: true,
        },
      },
    ],
    'prettier/prettier': 'error',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-unsupported-features/es-builtins': 'error',
  },
  overrides: [
    {
      files: ['*.test.js', '*.test.ts'],
      globals,
    },
    {
      files: ['*.ts'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
};
