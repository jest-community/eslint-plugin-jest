'use strict';

const { globals } = require('./index').environments.globals;

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:eslint-plugin/recommended',
    'plugin:node/recommended',
    'prettier',
  ],
  plugins: ['eslint-plugin', 'node', 'prettier'],
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
  },
  overrides: [
    {
      files: ['*.test.js'],
      globals,
    },
  ],
};
