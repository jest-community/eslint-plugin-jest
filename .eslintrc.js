'use strict';

const globals = require('./src/globals.json');

module.exports = {
  parser: require.resolve('@typescript-eslint/parser'),
  extends: [
    'plugin:eslint-plugin/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  plugins: [
    'eslint-plugin',
    'eslint-comments',
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
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-else-return': 'error',
    'no-negated-condition': 'error',
    eqeqeq: ['error', 'smart'],
    strict: 'error',
    'prefer-template': 'warn',
    'object-shorthand': ['warn', 'always', { avoidExplicitReturnArrows: true }],
    'prefer-destructuring': [
      'error',
      { VariableDeclarator: { array: true, object: true } },
    ],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    // TS covers this
    'node/no-missing-import': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-unsupported-features/es-builtins': 'error',
    'import/no-commonjs': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-unused-modules': 'error',
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
      files: ['src/**/*', 'dangerfile.ts'],
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
