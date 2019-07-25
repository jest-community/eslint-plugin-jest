import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../no-standalone-expect';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('no-standalone-expect', rule, {
  valid: [
    'describe("a test", () => { it("an it", () => {expect(1).toBe(1); }); });',
    'describe("a test", () => { it("an it", () => { const func = () => { expect(1).toBe(1); }; }); });',
    'describe("a test", () => { const func = () => { expect(1).toBe(1); }; });',
    'describe("a test", () => { function func() { expect(1).toBe(1); }; });',
    'describe("a test", () => { const func = function(){ expect(1).toBe(1); }; });',
    'it("an it", () => expect(1).toBe(1))',
    'const func = function(){ expect(1).toBe(1); };',
    'expect.hasAssertions()',
    '{}',
  ],
  invalid: [
    {
      code: 'describe("a test", () => { expect(1).toBe(1); });',
      errors: [{ endColumn: 37, column: 28, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'describe("a test", () => expect(1).toBe(1));',
      errors: [{ endColumn: 35, column: 26, messageId: 'unexpectedExpect' }],
    },
    {
      code:
        'describe("a test", () => { const func = () => { expect(1).toBe(1); }; expect(1).toBe(1); });',
      errors: [{ endColumn: 80, column: 71, messageId: 'unexpectedExpect' }],
    },
    {
      code:
        'describe("a test", () => {  it(() => { expect(1).toBe(1); }); expect(1).toBe(1); });',
      errors: [{ endColumn: 72, column: 63, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'expect(1).toBe(1);',
      errors: [{ endColumn: 10, column: 1, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'expect(1).toBe',
      errors: [{ endColumn: 10, column: 1, messageId: 'unexpectedExpect' }],
    },
    {
      code: '{expect(1).toBe(1)}',
      errors: [{ endColumn: 11, column: 2, messageId: 'unexpectedExpect' }],
    },
  ],
});
