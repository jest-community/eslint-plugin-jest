'use strict';

const globals = require('./index').environments.globals.globals;

module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
  },
  rules: {
    strict: 'error',
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['*.test.js'],
      globals,
    },
  ],
};
