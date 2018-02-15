'use strict';

const globals = require('./index').environments.globals.globals;

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:eslint-plugin/recommended',
    'prettier',
  ],
  plugins: ['eslint-plugin', 'node', 'prettier'],
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
  },
  rules: {
    eqeqeq: ['error', 'smart'],
    strict: 'error',
    'node/no-unsupported-features': 'error',
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['*.test.js'],
      globals,
    },
  ],
};
