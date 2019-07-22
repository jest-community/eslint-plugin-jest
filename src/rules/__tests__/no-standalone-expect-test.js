import { RuleTester } from 'eslint';
import rule from '../no-standalone-expect';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

ruleTester.run('no-export-out-of-test', rule, {
  valid: [
    'describe("a test", () => { it("an it", () => {expect(1).toBe(1); }); });',
  ],
  invalid: [
    {
      code: 'describe("a test", () => { expect(1).toBe(1); });',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 37, column: 28, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'expect(1).toBe(1);',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 10, column: 1, messageId: 'unexpectedExpect' }],
    },
  ],
});
