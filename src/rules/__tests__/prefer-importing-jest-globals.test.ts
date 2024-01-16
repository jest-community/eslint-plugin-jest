import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../prefer-importing-jest-globals';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

ruleTester.run('prefer-importing-jest-globals', rule, {
  valid: [
    {
      code: dedent`
        import { test, expect } from '@jest/globals';

        test('should pass', () => {
            expect(true).toBeDefined();
        });
        `,
      parserOptions: { sourceType: 'module' },
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
      parserOptions: { sourceType: 'module' },
    },
  ],
  invalid: [
    {
      code: dedent`
        describe("suite", () => { 
          test("foo"); 
          expect(true).toBeDefined();
        })
      `,
      output: dedent`
        import { describe, test, expect } from '@jest/globals';
        describe("suite", () => { 
          test("foo"); 
          expect(true).toBeDefined();
        })
    `,
      parserOptions: { sourceType: 'module' },
      errors: [
        { endColumn: 3, column: 1, messageId: 'preferImportingJestGlobal' },
      ],
    },
  ],
});
