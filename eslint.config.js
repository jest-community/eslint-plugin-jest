'use strict';

const pluginEslintCommentsConfigs = require('@eslint-community/eslint-plugin-eslint-comments/configs');
const pluginTypeScriptESLint = require('@typescript-eslint/eslint-plugin');
const parserTypeScriptESLint = require('@typescript-eslint/parser');
const { default: pluginESLintPlugin } = require('eslint-plugin-eslint-plugin');
const pluginImport = require('eslint-plugin-import');
const pluginN = require('eslint-plugin-n');
const pluginPrettier = require('eslint-plugin-prettier');
const pluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('./src/globals.json');

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  { files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'] },
  { ignores: ['.yarn', 'coverage/', 'lib/', 'src/rules/__tests__/fixtures'] },
  {
    plugins: {
      // @ts-expect-error types are currently not considered compatible currently
      //  todo: suspect this is because of differences in ESLint (types) versions
      '@typescript-eslint': pluginTypeScriptESLint,
      ...pluginEslintCommentsConfigs.recommended.plugins,
      import: pluginImport,
      'eslint-plugin': pluginESLintPlugin,
      n: pluginN,
      prettier: pluginPrettier,
    },
    languageOptions: { parser: parserTypeScriptESLint },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      ...pluginESLintPlugin.configs.recommended.rules,
      ...pluginEslintCommentsConfigs.recommended.rules,
      ...pluginPrettierRecommended.rules,
    },
  },
  {
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      // todo: enable once we drop support for ESLint <9.15
      'eslint-plugin/no-meta-schema-default': 'off',
      'eslint-plugin/require-meta-default-options': 'off',
      'eslint-plugin/require-meta-docs-description': [
        'error',
        { pattern: '^(Enforce|Require|Disallow|Suggest|Prefer)' },
      ],
      'eslint-plugin/require-meta-schema-description': 'off',
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
  },
  {
    files: ['*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['*.test.js', '*.test.ts'],
    languageOptions: { globals },
  },
  {
    files: [
      '.eslint-doc-generatorrc.js',
      'eslint.config.js',
      'babel.config.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-commonjs': 'off',
    },
  },
  {
    files: ['*.d.ts'],
    rules: {
      strict: 'off',
    },
  },
];

module.exports = config;
