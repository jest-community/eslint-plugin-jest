import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../valid-title';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
});

ruleTester.run('no-accidental-space', rule, {
  valid: [
    'it()',
    'describe()',
    'it("")',
    'it.each()()',
    'describe("foo", function () {})',
    'describe(6, function () {})',
    'fdescribe("foo", function () {})',
    'xdescribe("foo", function () {})',
    'it("foo", function () {})',
    'fit("foo", function () {})',
    'xit("foo", function () {})',
    'test("foo", function () {})',
    'xtest("foo", function () {})',
    'someFn("foo", function () {})',
    `
    describe('foo', () => {
      it('bar', () => {})
    })
    `,
  ],
  invalid: [
    {
      code: 'describe(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 10, line: 1 }],
    },
    {
      code: 'fdescribe(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
    },
    {
      code: 'xdescribe(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
    },
    {
      code: 'it(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 4, line: 1 }],
    },
    {
      code: 'fit(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
    },
    {
      code: 'xit(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
    },
    {
      code: 'xtest(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 7, line: 1 }],
    },
    {
      code: `
      describe(' foo', () => {
        it('bar', () => {})
      })
      `,
      errors: [{ messageId: 'accidentalSpace', column: 16, line: 2 }],
    },
    {
      code: `
      describe('foo', () => {
        it(' bar', () => {})
      })
      `,
      errors: [{ messageId: 'accidentalSpace', column: 12, line: 3 }],
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft describe', rule, {
  valid: [
    'describe("foo", function () {})',
    'fdescribe("foo", function () {})',
    'xdescribe("foo", function () {})',
  ],
  invalid: [
    {
      code: 'describe("describe foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 10, line: 1 }],
    },
    {
      code: 'fdescribe("describe foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
    },
    {
      code: 'xdescribe("describe foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft test', rule, {
  valid: ['test("foo", function () {})', 'xtest("foo", function () {})'],
  invalid: [
    {
      code: 'test("test foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 1 }],
    },
    {
      code: 'xtest("test foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 7, line: 1 }],
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft it', rule, {
  valid: [
    'it("foo", function () {})',
    'fit("foo", function () {})',
    'xit("foo", function () {})',
  ],
  invalid: [
    {
      code: 'it("it foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 4, line: 1 }],
    },
    {
      code: 'fit("it foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 5, line: 1 }],
    },
    {
      code: 'xit("it foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 5, line: 1 }],
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft nested', rule, {
  valid: [
    `
      describe('foo', () => {
        it('bar', () => {})
      })`,
  ],
  invalid: [
    {
      code: `
      describe('describe foo', () => {
        it('bar', () => {})
      })`,
      errors: [{ messageId: 'duplicatePrefix', column: 16, line: 2 }],
    },
    {
      code: `
      describe('foo', () => {
        it('it bar', () => {})
      })`,
      errors: [{ messageId: 'duplicatePrefix', column: 12, line: 3 }],
    },
  ],
});
