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
    'xtest(`foo`, function () {})',
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
      output: 'describe("foo", function () {})',
    },
    {
      code: 'describe(" foo foe fum", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 10, line: 1 }],
      output: 'describe("foo foe fum", function () {})',
    },
    {
      code: 'fdescribe(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
      output: 'fdescribe("foo", function () {})',
    },
    {
      code: "fdescribe(' foo', function () {})",
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
      output: "fdescribe('foo', function () {})",
    },
    {
      code: 'xdescribe(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
      output: 'xdescribe("foo", function () {})',
    },
    {
      code: 'it(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 4, line: 1 }],
      output: 'it("foo", function () {})',
    },
    {
      code: 'fit(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
      output: 'fit("foo", function () {})',
    },
    {
      code: 'xit(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
      output: 'xit("foo", function () {})',
    },
    {
      code: 'test(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'test(` foo`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
      output: 'test(`foo`, function () {})',
    },
    {
      code: 'test(` foo bar bang`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
      output: 'test(`foo bar bang`, function () {})',
    },
    {
      code: 'xtest(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 7, line: 1 }],
      output: 'xtest("foo", function () {})',
    },
    {
      code: `
      describe(' foo', () => {
        it('bar', () => {})
      })
      `,
      errors: [{ messageId: 'accidentalSpace', column: 16, line: 2 }],
      output: `
      describe('foo', () => {
        it('bar', () => {})
      })
      `,
    },
    {
      code: `
      describe('foo', () => {
        it(' bar', () => {})
      })
      `,
      errors: [{ messageId: 'accidentalSpace', column: 12, line: 3 }],
      output: `
      describe('foo', () => {
        it('bar', () => {})
      })
      `,
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
