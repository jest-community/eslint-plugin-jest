import { RuleTester } from 'eslint';
import rule from '../no-export';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('no-export', rule, {
  valid: [
    {
      code: 'describe("a test", () => { expect(1).toBe(1); })',
    },
  ],
  invalid: [
    {
      code:
        'export const myThing = "hello";  describe("a test", () => { expect(1).toBe(1);});',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 32, column: 1, messageId: 'unexpectedExport' }],
    },
  ],
});
