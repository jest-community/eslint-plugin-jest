import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-export';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
});

ruleTester.run('no-export', rule, {
  valid: [
    'describe("a test", () => { expect(1).toBe(1); })',
    'window.location = "valid"',
    'module.somethingElse = "foo";',
    'export const myThing = "valid"',
    'export default function () {}',
    'module.exports = function(){}',
    'module.exports.myThing = "valid";',
  ],
  invalid: [
    {
      code:
        'export const myThing = "invalid";  test("a test", () => { expect(1).toBe(1);});',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 34, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code:
        'export default function() {};  test("a test", () => { expect(1).toBe(1);});',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 29, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code:
        'module.exports["invalid"] = function() {};  test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 26, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code:
        'module.exports = function() {}; ;  test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 15, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code:
        'module.export.invalid = function() {}; ;  test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 22, column: 1, messageId: 'unexpectedExport' }],
    },
  ],
});
