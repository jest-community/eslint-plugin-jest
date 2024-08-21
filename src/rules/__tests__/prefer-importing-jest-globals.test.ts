import dedent from 'dedent';
import rule from '../prefer-importing-jest-globals';
import { FlatCompatRuleTester as RuleTester } from './test-utils';

new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
}).run('prefer-importing-jest-globals: typescript edition', rule, {
  valid: [],
  invalid: [
    {
      code: dedent`
        import describe from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        import { describe, expect, test } from '@jest/globals';
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
    {
      code: dedent`
        const {describe} = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        const { describe, expect, test } = require('@jest/globals');
        describe("suite", () => {
          test("foo");
          expect(true).toBeDefined();
        })
      `,
      parserOptions: { sourceType: 'script' },
      errors: [
        {
          endColumn: 7,
          column: 3,
          line: 3,
          messageId: 'preferImportingJestGlobal',
        },
      ],
    },
  ],
});
