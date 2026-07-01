import dedent from 'dedent';
import rule from '../no-export';
import { FlatCompatRuleTester as RuleTester, espreeParser } from './test-utils';

const ruleTester = new RuleTester({
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
    'export const myThing = "valid"',
    'export default function () {}',
    'module.exports = function(){}',
    'module.exports.myThing = "valid";',
    dedent`
      const module = {};
      module.exports = function () {};
      test('a test', () => {
        expect(1).toBe(1);
      });
    `,
    dedent`
      const module = {};
      module.somethingElse = 'foo';
      test('a test', () => {
        expect(1).toBe(1);
      });
    `,
    dedent`
      module.somethingElse = 'foo';
      test('a test', () => {
        expect(1).toBe(1);
      });
    `,
    dedent`
      const exports = {};
      exports.foo = function () {};
      test('a test', () => {
        expect(1).toBe(1);
      });
    `,
    dedent`
      const exports = 'foo';
      exports = function () {};
      test('a test', () => {
        expect(1).toBe(1);
      });
    `,
    dedent`
      function getModule() {
        return module;
      }

      getModule().exports = function () {};

      test('a test', () => {
        expect(1).toBe(1);
      });
    `,
    dedent`
      const exports = 'exports';
      module[exports] = function () {};
      test('a test', () => {
        expect(1).toBe(1);
      });
    `,
    {
      code: dedent`
        exports.foo = function () {};
        test('a test', () => {
          expect(1).toBe(1);
        });
      `,
      parserOptions: { sourceType: 'script' },
    },
    {
      code: dedent`
        exports = function () {};
        test('a test', () => {
          expect(1).toBe(1);
        });
      `,
      parserOptions: { sourceType: 'script' },
    },
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
      code: 'export = function() {}; test("a test", () => { expect(1).toBe(1);});',
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: { sourceType: 'module' },
      errors: [{ endColumn: 24, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        module.export.invalid = function () {};

        test('a test', () => {
          expect(1).toBe(1);
        });
      `,
      errors: [{ endColumn: 22, column: 1, messageId: 'unexpectedExport' }],
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
      code: 'module["exports"] = function() {}; test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 18, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: 'module.exports.foo.bar = function() {}; test("a test", () => { expect(1).toBe(1);});',
      errors: [{ endColumn: 23, column: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        module.exports = function () {};

        describe('a test', () => {
          expect(1).toBe(1);
        });
      `,
      errors: [{ endColumn: 15, column: 1, messageId: 'unexpectedExport' }],
    },
  ],
});
