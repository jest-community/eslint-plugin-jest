import { RuleTester as ESLintRuleTester } from 'eslint';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-jest-import';

const RuleTester: TSESLint.RuleTester = ESLintRuleTester as any;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('no-jest-import', rule, {
  valid: [
    {
      code: 'import something from "something"',
      parserOptions: { sourceType: 'module' },
    },
    'require("somethingElse")',
    'require()',
    'entirelyDifferent(fn)',
  ],
  invalid: [
    {
      code: 'require("jest")',
      errors: [
        {
          endColumn: 15,
          column: 9,
          messageId: 'unexpectedImport',
        },
      ],
    },
    {
      code: 'import jest from "jest"',
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 24,
          column: 18,
          messageId: 'unexpectedImport',
        },
      ],
    },
    {
      code: 'var jest = require("jest")',
      errors: [
        {
          endColumn: 26,
          column: 20,
          messageId: 'unexpectedImport',
        },
      ],
    },
    {
      code: 'import {jest as test} from "jest"',
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 34,
          column: 28,
          messageId: 'unexpectedImport',
        },
      ],
    },
    {
      code: 'const jest = require("jest")',
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 28,
          column: 22,
          messageId: 'unexpectedImport',
        },
      ],
    },
  ],
});
