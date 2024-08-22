import dedent from 'dedent';
import rule from '../prefer-importing-jest-globals';
import { FlatCompatRuleTester as RuleTester } from './test-utils';

new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
}).run('prefer-importing-jest-globals: typescript edition', rule, {
  valid: [
    {
      code: dedent`
        // with import
        import { test, expect } from '@jest/globals';
        test('should pass', () => {
            expect(true).toBeDefined();
        });
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        test('should pass', () => {
            expect(true).toBeDefined();
        });
      `,
      options: [{ types: ['jest'] }],
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        const { it } = require('@jest/globals');
        it('should pass', () => {
            expect(true).toBeDefined();
        });
      `,
      options: [{ types: ['test'] }],
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        // with require
        const { test, expect } = require('@jest/globals');
        test('should pass', () => {
            expect(true).toBeDefined();
        });
      `,
    },
    {
      code: dedent`
        const { test, expect } = require(\`@jest/globals\`);
        test('should pass', () => {
            expect(true).toBeDefined();
        });
      `,
    },
    {
      code: dedent`
        import { it as itChecks } from '@jest/globals';
        itChecks("foo");
      `,
      parserOptions: { sourceType: 'module' },
    },
    {
      code: dedent`
        const { test } = require('@jest/globals');
        test("foo");
      `,
    },
    {
      code: dedent`
        const { test } = require('my-test-library');
        test("foo");
      `,
    },
  ],
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
