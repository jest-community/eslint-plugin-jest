import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../valid-title';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('disallowedWords option', rule, {
  valid: [
    'describe("the correct way to properly handle all the things", () => {});',
    'test("that all is as it should be", () => {});',
    {
      code: 'it("correctly sets the value", () => {});',
      options: [
        { ignoreTypeOfDescribeName: false, disallowedWords: ['correct'] },
      ],
    },
    {
      code: 'it("correctly sets the value", () => {});',
      options: [{ disallowedWords: undefined }],
    },
  ],
  invalid: [
    {
      code: 'test("the correct way to properly handle all things", () => {});',
      options: [{ disallowedWords: ['correct', 'properly', 'all'] }],
      errors: [
        {
          messageId: 'disallowedWord',
          data: { word: 'correct' },
          column: 6,
          line: 1,
        },
      ],
    },
    {
      code: 'describe("the correct way to do things", function () {})',
      options: [{ disallowedWords: ['correct'] }],
      errors: [
        {
          messageId: 'disallowedWord',
          data: { word: 'correct' },
          column: 10,
          line: 1,
        },
      ],
    },
    {
      code: 'it("has ALL the things", () => {})',
      options: [{ disallowedWords: ['all'] }],
      errors: [
        {
          messageId: 'disallowedWord',
          data: { word: 'ALL' },
          column: 4,
          line: 1,
        },
      ],
    },
    {
      code: 'xdescribe("every single one of them", function () {})',
      options: [{ disallowedWords: ['every'] }],
      errors: [
        {
          messageId: 'disallowedWord',
          data: { word: 'every' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: "describe('Very Descriptive Title Goes Here', function () {})",
      options: [{ disallowedWords: ['descriptive'] }],
      errors: [
        {
          messageId: 'disallowedWord',
          data: { word: 'Descriptive' },
          column: 10,
          line: 1,
        },
      ],
    },
    {
      code: 'test(`that the value is set properly`, function () {})',
      options: [{ disallowedWords: ['properly'] }],
      errors: [
        {
          messageId: 'disallowedWord',
          data: { word: 'properly' },
          column: 6,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('title-must-be-string', rule, {
  valid: [
    'it("is a string", () => {});',
    'it("is" + " a " + " string", () => {});',
    'it(1 + " + " + 1, () => {});',
    'test("is a string", () => {});',
    'xtest("is a string", () => {});',
    'xtest(`${myFunc} is a string`, () => {});',
    'describe("is a string", () => {});',
    'describe.skip("is a string", () => {});',
    'describe.skip(`${myFunc} is a string`, () => {});',
    'fdescribe("is a string", () => {});',
    {
      code: 'describe(String(/.+/), () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'describe(myFunction, () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
    },
    {
      code: 'xdescribe(skipFunction, () => {});',
      options: [{ ignoreTypeOfDescribeName: true, disallowedWords: [] }],
    },
  ],
  invalid: [
    {
      code: 'it.each([])(1, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 13,
          line: 1,
        },
      ],
    },
    {
      code: 'it(123, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 4,
          line: 1,
        },
      ],
    },
    {
      code: 'it.concurrent(123, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 15,
          line: 1,
        },
      ],
    },
    {
      code: 'it(1 + 2 + 3, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 4,
          line: 1,
        },
      ],
    },
    {
      code: 'it.concurrent(1 + 2 + 3, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 15,
          line: 1,
        },
      ],
    },
    {
      code: 'test.skip(123, () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'test.concurrent.skip(123, () => {});',
      options: [{ ignoreTypeOfDescribeName: true }],
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 22,
          line: 1,
        },
      ],
    },
    {
      code: 'describe(String(/.+/), () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 10,
          line: 1,
        },
      ],
    },
    {
      code: 'describe(myFunction, () => 1);',
      options: [{ ignoreTypeOfDescribeName: false }],
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 10,
          line: 1,
        },
      ],
    },
    {
      code: 'describe(myFunction, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 10,
          line: 1,
        },
      ],
    },
    {
      code: 'xdescribe(myFunction, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'describe(6, function () {})',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 10,
          line: 1,
        },
      ],
    },
    {
      code: 'describe.skip(123, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 15,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('no-empty-title', rule, {
  valid: [
    'describe()',
    'someFn("", function () {})',
    'describe("foo", function () {})',
    'describe("foo", function () { it("bar", function () {}) })',
    'test("foo", function () {})',
    'test.concurrent("foo", function () {})',
    'test(`foo`, function () {})',
    'test.concurrent(`foo`, function () {})',
    'test(`${foo}`, function () {})',
    'test.concurrent(`${foo}`, function () {})',
    "it('foo', function () {})",
    'it.each([])()',
    "it.concurrent('foo', function () {})",
    "xdescribe('foo', function () {})",
    "xit('foo', function () {})",
    "xtest('foo', function () {})",
  ],
  invalid: [
    {
      code: 'describe("", function () {})',
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'describe' },
        },
      ],
    },
    {
      code: ["describe('foo', () => {", "it('', () => {})", '})'].join('\n'),
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 2,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: 'it("", function () {})',
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: 'it.concurrent("", function () {})',
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: 'test("", function () {})',
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: 'test.concurrent("", function () {})',
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: 'test(``, function () {})',
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: 'test.concurrent(``, function () {})',
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: "xdescribe('', () => {})",
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'describe' },
        },
      ],
    },
    {
      code: "xit('', () => {})",
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
    {
      code: "xtest('', () => {})",
      errors: [
        {
          messageId: 'emptyTitle',
          column: 1,
          line: 1,
          data: { jestFunctionName: 'test' },
        },
      ],
    },
  ],
});

ruleTester.run('no-accidental-space', rule, {
  valid: [
    'it()',
    'it.concurrent()',
    'describe()',
    'it.each()()',
    'describe("foo", function () {})',
    'fdescribe("foo", function () {})',
    'xdescribe("foo", function () {})',
    'it("foo", function () {})',
    'it.concurrent("foo", function () {})',
    'fit("foo", function () {})',
    'fit.concurrent("foo", function () {})',
    'xit("foo", function () {})',
    'test("foo", function () {})',
    'test.concurrent("foo", function () {})',
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
      code: 'describe("foo foe fum ", function () {})',
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
      code: 'it.concurrent(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 15, line: 1 }],
      output: 'it.concurrent("foo", function () {})',
    },
    {
      code: 'fit(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
      output: 'fit("foo", function () {})',
    },
    {
      code: 'fit.concurrent(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 16, line: 1 }],
      output: 'fit.concurrent("foo", function () {})',
    },
    {
      code: 'fit("foo ", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
      output: 'fit("foo", function () {})',
    },
    {
      code: 'fit.concurrent("foo ", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 16, line: 1 }],
      output: 'fit.concurrent("foo", function () {})',
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
      code: 'test.concurrent(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
      output: 'test.concurrent("foo", function () {})',
    },
    {
      code: 'test(` foo`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
      output: 'test(`foo`, function () {})',
    },
    {
      code: 'test.concurrent(` foo`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
      output: 'test.concurrent(`foo`, function () {})',
    },
    {
      code: 'test(` foo bar bang`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
      output: 'test(`foo bar bang`, function () {})',
    },
    {
      code: 'test.concurrent(` foo bar bang`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
      output: 'test.concurrent(`foo bar bang`, function () {})',
    },
    {
      code: 'test(` foo bar bang  `, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
      output: 'test(`foo bar bang`, function () {})',
    },
    {
      code: 'test.concurrent(` foo bar bang  `, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
      output: 'test.concurrent(`foo bar bang`, function () {})',
    },
    {
      code: 'xtest(" foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 7, line: 1 }],
      output: 'xtest("foo", function () {})',
    },
    {
      code: 'xtest(" foo  ", function () {})',
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
    'xdescribe(`foo`, function () {})',
  ],
  invalid: [
    {
      code: 'describe("describe foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 10, line: 1 }],
      output: 'describe("foo", function () {})',
    },
    {
      code: 'fdescribe("describe foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
      output: 'fdescribe("foo", function () {})',
    },
    {
      code: 'xdescribe("describe foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
      output: 'xdescribe("foo", function () {})',
    },
    {
      code: "describe('describe foo', function () {})",
      errors: [{ messageId: 'duplicatePrefix', column: 10, line: 1 }],
      output: "describe('foo', function () {})",
    },
    {
      code: 'fdescribe(`describe foo`, function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
      output: 'fdescribe(`foo`, function () {})',
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft test', rule, {
  valid: [
    'test("foo", function () {})',
    "test('foo', function () {})",
    'xtest("foo", function () {})',
    'xtest(`foo`, function () {})',
    'test("foo test", function () {})',
    'xtest("foo test", function () {})',
  ],
  invalid: [
    {
      code: 'test("test foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 1 }],
      output: 'test("foo", function () {})',
    },
    {
      code: 'xtest("test foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 7, line: 1 }],
      output: 'xtest("foo", function () {})',
    },
    {
      code: 'test(`test foo`, function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 1 }],
      output: 'test(`foo`, function () {})',
    },
    {
      code: 'test(`test foo test`, function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 1 }],
      output: 'test(`foo test`, function () {})',
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft it', rule, {
  valid: [
    'it("foo", function () {})',
    'fit("foo", function () {})',
    'xit("foo", function () {})',
    'xit(`foo`, function () {})',
    'it("foos it correctly", function () {})',
  ],
  invalid: [
    {
      code: 'it("it foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 4, line: 1 }],
      output: 'it("foo", function () {})',
    },
    {
      code: 'fit("it foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 5, line: 1 }],
      output: 'fit("foo", function () {})',
    },
    {
      code: 'xit("it foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 5, line: 1 }],
      output: 'xit("foo", function () {})',
    },
    {
      code: 'it("it foos it correctly", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 4, line: 1 }],
      output: 'it("foos it correctly", function () {})',
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft nested', rule, {
  valid: [
    `
    describe('foo', () => {
      it('bar', () => {})
    })
    `,
    `
    describe('foo', () => {
      it('describes things correctly', () => {})
    })
    `,
  ],
  invalid: [
    {
      code: `
      describe('describe foo', () => {
        it('bar', () => {})
      })
      `,
      errors: [{ messageId: 'duplicatePrefix', column: 16, line: 2 }],
      output: `
      describe('foo', () => {
        it('bar', () => {})
      })
      `,
    },
    {
      code: `
      describe('describe foo', () => {
        it('describes things correctly', () => {})
      })
      `,
      errors: [{ messageId: 'duplicatePrefix', column: 16, line: 2 }],
      output: `
      describe('foo', () => {
        it('describes things correctly', () => {})
      })
      `,
    },
    {
      code: `
      describe('foo', () => {
        it('it bar', () => {})
      })
      `,
      errors: [{ messageId: 'duplicatePrefix', column: 12, line: 3 }],
      output: `
      describe('foo', () => {
        it('bar', () => {})
      })
      `,
    },
  ],
});
