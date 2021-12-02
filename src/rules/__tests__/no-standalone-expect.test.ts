import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import rule from '../no-standalone-expect';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
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
    'const func = () => expect(1).toBe(1);',
    'expect.hasAssertions()',
    '{}',
    'it.each([1, true])("trues", value => { expect(value).toBe(true); });',
    'it.each([1, true])("trues", value => { expect(value).toBe(true); }); it("an it", () => { expect(1).toBe(1) });',
    dedent`
      it.each\`
        num   | value
        \${1} | \${true}
      \`('trues', ({ value }) => {
        expect(value).toBe(true);
      });
    `,
    'it.only("an only", value => { expect(value).toBe(true); });',
    'it.concurrent("an concurrent", value => { expect(value).toBe(true); });',
    'describe.each([1, true])("trues", value => { it("an it", () => expect(value).toBe(true) ); });',
    {
      code: dedent`
        describe('scenario', () => {
          const t = Math.random() ? it.only : it;
          t('testing', () => expect(true));
        });
      `,
      options: [{ additionalTestBlockFunctions: ['t'] }],
    },
    {
      code: dedent`
        each([
          [1, 1, 2],
          [1, 2, 3],
          [2, 1, 3],
        ]).test('returns the result of adding %d to %d', (a, b, expected) => {
          expect(a + b).toBe(expected);
        });
      `,
      options: [{ additionalTestBlockFunctions: ['each.test'] }],
    },
    {
      code: dedent`
        function expectToBeFoo(value) {
          return expect(value).toBe("foo")
        }
        describe('scenario', () => {
          expectToBeFoo("foo")
        });
      `,
      options: [{ additionalTestBlockFunctions: ['expect*'] }],
    },
  ],
  invalid: [
    {
      code: "(() => {})('testing', () => expect(true))",
      errors: [{ endColumn: 41, column: 29, messageId: 'unexpectedExpect' }],
    },
    {
      code: dedent`
        describe('scenario', () => {
          const t = Math.random() ? it.only : it;
          t('testing', () => expect(true));
        });
      `,
      errors: [{ endColumn: 34, column: 22, messageId: 'unexpectedExpect' }],
    },
    {
      code: dedent`
        describe('scenario', () => {
          const t = Math.random() ? it.only : it;
          t('testing', () => expect(true));
        });
      `,
      options: [{ additionalTestBlockFunctions: undefined }],
      errors: [{ endColumn: 34, column: 22, messageId: 'unexpectedExpect' }],
    },
    {
      code: dedent`
        each([
          [1, 1, 2],
          [1, 2, 3],
          [2, 1, 3],
        ]).test('returns the result of adding %d to %d', (a, b, expected) => {
          expect(a + b).toBe(expected);
        });
      `,
      errors: [{ endColumn: 16, column: 3, messageId: 'unexpectedExpect' }],
    },
    {
      code: dedent`
        each([
          [1, 1, 2],
          [1, 2, 3],
          [2, 1, 3],
        ]).test('returns the result of adding %d to %d', (a, b, expected) => {
          expect(a + b).toBe(expected);
        });
      `,
      options: [{ additionalTestBlockFunctions: ['each'] }],
      errors: [{ endColumn: 16, column: 3, messageId: 'unexpectedExpect' }],
    },
    {
      code: dedent`
        each([
          [1, 1, 2],
          [1, 2, 3],
          [2, 1, 3],
        ]).test('returns the result of adding %d to %d', (a, b, expected) => {
          expect(a + b).toBe(expected);
        });
      `,
      options: [{ additionalTestBlockFunctions: ['test'] }],
      errors: [{ endColumn: 16, column: 3, messageId: 'unexpectedExpect' }],
    },
    {
      code: dedent`
        function expectToBeFoo(value) {
          return expect(value)
        }
        describe('scenario', () => {
          expectToBeFoo("foo")
        });
      `,
      options: [{ additionalTestBlockFunctions: ['expect*'] }],
      errors: [
        { line: 2, endColumn: 17, column: 9, messageId: 'unexpectedExpect' },
      ],
    },
    {
      code: 'describe("a test", () => { expect(1).toBe(1); });',
      errors: [{ endColumn: 37, column: 28, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'describe("a test", () => expect(1).toBe(1));',
      errors: [{ endColumn: 35, column: 26, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'describe("a test", () => { const func = () => { expect(1).toBe(1); }; expect(1).toBe(1); });',
      errors: [{ endColumn: 80, column: 71, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'describe("a test", () => {  it(() => { expect(1).toBe(1); }); expect(1).toBe(1); });',
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
    {
      code: 'it.each([1, true])("trues", value => { expect(value).toBe(true); }); expect(1).toBe(1);',
      errors: [{ endColumn: 79, column: 70, messageId: 'unexpectedExpect' }],
    },
    {
      code: 'describe.each([1, true])("trues", value => { expect(value).toBe(true); });',
      errors: [{ endColumn: 59, column: 46, messageId: 'unexpectedExpect' }],
    },
  ],
});
