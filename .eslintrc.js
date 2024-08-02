'use strict';

const {
  version: typescriptESLintPluginVersion,
} = require('@typescript-eslint/eslint-plugin/package.json');
const semver = require('semver');
const globals = require('./src/globals.json');

const typescriptBanTypesRules = () => {
  if (semver.major(typescriptESLintPluginVersion) === 8) {
    return {
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
    };
  }

  return {
    '@typescript-eslint/ban-types': 'error',
  };
};

module.exports = {
  parser: require.resolve('@typescript-eslint/parser'),
  extends: [
    'plugin:eslint-plugin/recommended',
    'plugin:@eslint-community/eslint-comments/recommended',
    'plugin:n/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
  ],
  plugins: [
    'eslint-plugin',
    '@eslint-community/eslint-comments',
    'n',
    'import',
    '@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/ban-ts-comment': 'error',
    ...typescriptBanTypesRules(),
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@eslint-community/eslint-comments/no-unused-disable': 'error',
    'eslint-plugin/require-meta-docs-description': [
      'error',
      { pattern: '^(Enforce|Require|Disallow|Suggest|Prefer)' },
    ],
    'eslint-plugin/test-case-property-ordering': 'error',
    'no-else-return': 'error',
    'no-negated-condition': 'error',
    eqeqeq: ['error', 'smart'],
    strict: 'error',
    'prefer-template': 'error',
    'object-shorthand': [
      'error',
      'always',
      { avoidExplicitReturnArrows: true },
    ],
    'prefer-destructuring': [
      'error',
      { VariableDeclarator: { array: true, object: true } },
    ],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'require-unicode-regexp': 'error',
    // TS covers these 2
    'n/no-missing-import': 'off',
    'n/no-missing-require': 'off',
    'n/no-unsupported-features/es-syntax': 'off',
    'n/no-unsupported-features/es-builtins': 'error',
    'import/no-commonjs': 'error',
    'import/no-duplicates': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-unused-modules': 'error',
    'import/order': [
      'error',
      { alphabetize: { order: 'asc' }, 'newlines-between': 'never' },
    ],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'any', prev: 'directive', next: 'directive' },
    ],

    'prefer-spread': 'error',
    'prefer-rest-params': 'error',
    'prefer-const': ['error', { destructuring: 'all' }],
    'no-var': 'error',
    curly: 'error',
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
      files: ['src/**/*', 'dangerfile.ts', './jest.config.ts'],
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
