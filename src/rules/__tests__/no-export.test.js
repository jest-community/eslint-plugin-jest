import { RuleTester } from 'eslint';
import rule from '../no-export';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('no-export', rule, {
  valid: [
    'describe("a test", () => { expect(1).toBe(1); })',
    'window.location = "hello"',
    'module.somethingElse = "foo";',
  ],
  invalid: [
    {
      code:
        'export const myThing = "hello";  describe("a test", () => { expect(1).toBe(1);});',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 32, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code:
        'export default function() {};  describe("a test", () => { expect(1).toBe(1);});',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 29, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code:
        'module.exports["foo"] = function() {};  describe("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 22, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: 'module.exports = function() {};',
      errors: [{ endColumn: 15, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: 'module.export.thing = function() {};',
      errors: [{ endColumn: 20, column: 1, messageId: 'unexpectedExport' }],
    },
  ],
});
