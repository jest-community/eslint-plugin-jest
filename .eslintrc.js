'use strict';

const globals = require('./src/globals.json');

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:eslint-plugin/recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier',
  ],
  plugins: [
    'eslint-plugin',
    'node',
    'prettier',
    'import',
    '@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/array-type': ['error', 'array-simple'],
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/ban-types': 'error',
    'no-else-return': 'error',
    eqeqeq: ['error', 'smart'],
    strict: 'error',
    'prefer-template': 'warn',
    'object-shorthand': ['warn', 'always', { avoidExplicitReturnArrows: true }],
    'prefer-destructuring': [
      'error',
      { VariableDeclarator: { array: true, object: true } },
    ],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'prettier/prettier': 'error',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-unsupported-features/es-builtins': 'error',
    'import/no-commonjs': 'error',
    'import/no-unused-modules': 'error',
    'import/no-extraneous-dependencies': 'error',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['*.test.js', '*.test.ts'],
      globals,
    },
    {
      files: 'src/**/*',
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['.eslintrc.js', 'babel.config.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        'import/no-commonjs': 'off',
      },
    },
  ],
};
