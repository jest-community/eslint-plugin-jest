import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../no-export';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
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
      code: 'export const myThing = "invalid"; test("a test", () => { expect(1).toBe(1);});',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 34, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        export const myThing = 'invalid';

        test.each()('my code', () => {
          expect(1).toBe(1);
        });
      `,
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 34, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        export const myThing = 'invalid';

        test.each\`\`('my code', () => {
          expect(1).toBe(1);
        });
      `,
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 34, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        export const myThing = 'invalid';

        test.only.each\`\`('my code', () => {
          expect(1).toBe(1);
        });
      `,
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 34, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: 'export default function() {};  test("a test", () => { expect(1).toBe(1);});',
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 29, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: 'module.exports["invalid"] = function() {};  test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 26, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: 'module.exports = function() {}; ;  test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 15, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: 'module.export.invalid = function() {}; ;  test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 22, column: 1, messageId: 'unexpectedExport' }],
    },
  ],
});
