'use strict';

const globals = require('./index').environments.globals.globals;

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:eslint-plugin/recommended',
    'prettier',
  ],
  plugins: ['eslint-plugin', 'prettier'],
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
  },
  rules: {
    strict: 'error',
    'eslint-plugin/require-meta-docs-url': 'error',
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['*.test.js'],
      globals,
    },
  ],
};
