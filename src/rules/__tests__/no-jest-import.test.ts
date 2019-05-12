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

const moduleSourceType = { sourceType: 'module' } as const;

ruleTester.run('no-jest-import', rule, {
  valid: [
    {
      code: 'import something from "something"',
      parserOptions: moduleSourceType,
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
          // @ts-ignore: https://github.com/typescript-eslint/typescript-eslint/pull/517
          endColumn: 15,
          column: 9,
          messageId: 'unexpectedImport',
        } as const,
      ],
    },
    {
      code: 'import jest from "jest"',
      parserOptions: moduleSourceType,
      errors: [
        {
          // @ts-ignore: https://github.com/typescript-eslint/typescript-eslint/pull/517
          endColumn: 24,
          column: 18,
          messageId: 'unexpectedImport',
        } as const,
      ],
    },
    {
      code: 'var jest = require("jest")',
      errors: [
        {
          // @ts-ignore: https://github.com/typescript-eslint/typescript-eslint/pull/517
          endColumn: 26,
          column: 20,
          messageId: 'unexpectedImport',
        } as const,
      ],
    },
    {
      code: 'import {jest as test} from "jest"',
      parserOptions: moduleSourceType,
      errors: [
        {
          // @ts-ignore: https://github.com/typescript-eslint/typescript-eslint/pull/517
          endColumn: 34,
          column: 28,
          messageId: 'unexpectedImport',
        } as const,
      ],
    },
    {
      code: 'const jest = require("jest")',
      parserOptions: moduleSourceType,
      errors: [
        {
          // @ts-ignore: https://github.com/typescript-eslint/typescript-eslint/pull/517
          endColumn: 28,
          column: 22,
          messageId: 'unexpectedImport',
        } as const,
      ],
    },
  ],
});
