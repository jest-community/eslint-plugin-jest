import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../valid-title';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
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

ruleTester.run('mustMatch & mustNotMatch options', rule, {
  valid: [
    'describe("the correct way to properly handle all the things", () => {});',
    'test("that all is as it should be", () => {});',
    {
      code: 'it("correctly sets the value", () => {});',
      options: [{ mustMatch: {} }],
    },
    {
      code: 'it("correctly sets the value", () => {});',
      options: [{ mustMatch: / /u.source }],
    },
    {
      code: 'it("correctly sets the value", () => {});',
      options: [{ mustMatch: [/ /u.source] }],
    },
    {
      code: 'it("correctly sets the value #unit", () => {});',
      options: [{ mustMatch: /#(?:unit|integration|e2e)/u.source }],
    },
    {
      code: 'it("correctly sets the value", () => {});',
      options: [{ mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source }],
    },
    {
      code: 'it("correctly sets the value", () => {});',
      options: [{ mustMatch: { test: /#(?:unit|integration|e2e)/u.source } }],
    },
    {
      code: dedent`
        describe('things to test', () => {
          describe('unit tests #unit', () => {
            it('is true', () => {
              expect(true).toBe(true);
            });
          });

          describe('e2e tests #e2e', () => {
            it('is another test #jest4life', () => {});
          });
        });
      `,
      options: [{ mustMatch: { test: /^[^#]+$|(?:#(?:unit|e2e))/u.source } }],
    },
  ],
  invalid: [
    {
      code: dedent`
        describe('things to test', () => {
          describe('unit tests #unit', () => {
            it('is true', () => {
              expect(true).toBe(true);
            });
          });

          describe('e2e tests #e4e', () => {
            it('is another test #e2e #jest4life', () => {});
          });
        });
      `,
      options: [
        {
          mustNotMatch: /(?:#(?!unit|e2e))\w+/u.source,
          mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source,
        },
      ],
      errors: [
        {
          messageId: 'mustNotMatch',
          data: {
            jestFunctionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          column: 12,
          line: 8,
        },
        {
          messageId: 'mustNotMatch',
          data: {
            jestFunctionName: 'it',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          column: 8,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        import { describe, describe as context, it as thisTest } from '@jest/globals';

        describe('things to test', () => {
          context('unit tests #unit', () => {
            thisTest('is true', () => {
              expect(true).toBe(true);
            });
          });

          context('e2e tests #e4e', () => {
            thisTest('is another test #e2e #jest4life', () => {});
          });
        });
      `,
      parserOptions: { sourceType: 'module' },
      options: [
        {
          mustNotMatch: /(?:#(?!unit|e2e))\w+/u.source,
          mustMatch: /^[^#]+$|(?:#(?:unit|e2e))/u.source,
        },
      ],
      errors: [
        {
          messageId: 'mustNotMatch',
          data: {
            jestFunctionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          column: 11,
          line: 10,
        },
        {
          messageId: 'mustNotMatch',
          data: {
            jestFunctionName: 'it',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          column: 14,
          line: 11,
        },
      ],
    },
    {
      code: dedent`
        describe('things to test', () => {
          describe('unit tests #unit', () => {
            it('is true', () => {
              expect(true).toBe(true);
            });
          });

          describe('e2e tests #e4e', () => {
            it('is another test #e2e #jest4life', () => {});
          });
        });
      `,
      options: [
        {
          mustNotMatch: [
            /(?:#(?!unit|e2e))\w+/u.source,
            'Please include "#unit" or "#e2e" in titles',
          ],
          mustMatch: [
            /^[^#]+$|(?:#(?:unit|e2e))/u.source,
            'Please include "#unit" or "#e2e" in titles',
          ],
        },
      ],
      errors: [
        {
          messageId: 'mustNotMatchCustom',
          data: {
            jestFunctionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
            message: 'Please include "#unit" or "#e2e" in titles',
          },
          column: 12,
          line: 8,
        },
        {
          messageId: 'mustNotMatchCustom',
          data: {
            jestFunctionName: 'it',
            pattern: /(?:#(?!unit|e2e))\w+/u,
            message: 'Please include "#unit" or "#e2e" in titles',
          },
          column: 8,
          line: 9,
        },
      ],
    },
    {
      code: dedent`
        describe('things to test', () => {
          describe('unit tests #unit', () => {
            it('is true', () => {
              expect(true).toBe(true);
            });
          });

          describe('e2e tests #e4e', () => {
            it('is another test #e2e #jest4life', () => {});
          });
        });
      `,
      options: [
        {
          mustNotMatch: { describe: [/(?:#(?!unit|e2e))\w+/u.source] },
          mustMatch: { describe: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
        },
      ],
      errors: [
        {
          messageId: 'mustNotMatch',
          data: {
            jestFunctionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          column: 12,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        describe('things to test', () => {
          describe('unit tests #unit', () => {
            it('is true', () => {
              expect(true).toBe(true);
            });
          });

          describe('e2e tests #e4e', () => {
            it('is another test #e2e #jest4life', () => {});
          });
        });
      `,
      options: [
        {
          mustNotMatch: {
            describe: [
              /(?:#(?!unit|e2e))\w+/u.source,
              'Please include "#unit" or "#e2e" in describe titles',
            ],
          },
          mustMatch: { describe: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
        },
      ],
      errors: [
        {
          messageId: 'mustNotMatchCustom',
          data: {
            jestFunctionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
            message: 'Please include "#unit" or "#e2e" in describe titles',
          },
          column: 12,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        describe('things to test', () => {
          describe('unit tests #unit', () => {
            it('is true', () => {
              expect(true).toBe(true);
            });
          });

          describe('e2e tests #e4e', () => {
            it('is another test #e2e #jest4life', () => {});
          });
        });
      `,
      options: [
        {
          mustNotMatch: { describe: /(?:#(?!unit|e2e))\w+/u.source },
          mustMatch: { it: /^[^#]+$|(?:#(?:unit|e2e))/u.source },
        },
      ],
      errors: [
        {
          messageId: 'mustNotMatch',
          data: {
            jestFunctionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
          },
          column: 12,
          line: 8,
        },
      ],
    },
    {
      code: dedent`
        describe('things to test', () => {
          describe('unit tests #unit', () => {
            it('is true #jest4life', () => {
              expect(true).toBe(true);
            });
          });

          describe('e2e tests #e4e', () => {
            it('is another test #e2e #jest4life', () => {});
          });
        });
      `,
      options: [
        {
          mustNotMatch: {
            describe: [
              /(?:#(?!unit|e2e))\w+/u.source,
              'Please include "#unit" or "#e2e" in describe titles',
            ],
          },
          mustMatch: {
            it: [
              /^[^#]+$|(?:#(?:unit|e2e))/u.source,
              'Please include "#unit" or "#e2e" in it titles',
            ],
          },
        },
      ],
      errors: [
        {
          messageId: 'mustMatchCustom',
          data: {
            jestFunctionName: 'it',
            pattern: /^[^#]+$|(?:#(?:unit|e2e))/u,
            message: 'Please include "#unit" or "#e2e" in it titles',
          },
          column: 8,
          line: 3,
        },
        {
          messageId: 'mustNotMatchCustom',
          data: {
            jestFunctionName: 'describe',
            pattern: /(?:#(?!unit|e2e))\w+/u,
            message: 'Please include "#unit" or "#e2e" in describe titles',
          },
          column: 12,
          line: 8,
        },
      ],
    },
    {
      code: 'test("the correct way to properly handle all things", () => {});',
      options: [{ mustMatch: /#(?:unit|integration|e2e)/u.source }],
      errors: [
        {
          messageId: 'mustMatch',
          data: {
            jestFunctionName: 'test',
            pattern: /#(?:unit|integration|e2e)/u,
          },
          column: 6,
          line: 1,
        },
      ],
    },
    {
      code: 'describe("the test", () => {});',
      options: [
        { mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } },
      ],
      errors: [
        {
          messageId: 'mustMatch',
          data: {
            jestFunctionName: 'describe',
            pattern: /#(?:unit|integration|e2e)/u,
          },
          column: 10,
          line: 1,
        },
      ],
    },
    {
      code: 'xdescribe("the test", () => {});',
      options: [
        { mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } },
      ],
      errors: [
        {
          messageId: 'mustMatch',
          data: {
            jestFunctionName: 'describe',
            pattern: /#(?:unit|integration|e2e)/u,
          },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'describe.skip("the test", () => {});',
      options: [
        { mustMatch: { describe: /#(?:unit|integration|e2e)/u.source } },
      ],
      errors: [
        {
          messageId: 'mustMatch',
          data: {
            jestFunctionName: 'describe',
            pattern: /#(?:unit|integration|e2e)/u,
          },
          column: 15,
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
      code: 'it.skip.each([])(1, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 18,
          line: 1,
        },
      ],
    },
    {
      code: 'it.skip.each``(1, () => {});',
      errors: [
        {
          messageId: 'titleMustBeString',
          column: 16,
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
      code: dedent`
        describe('foo', () => {
          it('', () => {});
        });
      `,
      errors: [
        {
          messageId: 'emptyTitle',
          column: 3,
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
    dedent`
      describe('foo', () => {
        it('bar', () => {})
      })
    `,
  ],
  invalid: [
    {
      code: 'describe(" foo", function () {})',
      output: 'describe("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 10, line: 1 }],
    },
    {
      code: 'describe.each()(" foo", function () {})',
      output: 'describe.each()("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
    },
    {
      code: 'describe.only.each()(" foo", function () {})',
      output: 'describe.only.each()("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 22, line: 1 }],
    },
    {
      code: 'describe(" foo foe fum", function () {})',
      output: 'describe("foo foe fum", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 10, line: 1 }],
    },
    {
      code: 'describe("foo foe fum ", function () {})',
      output: 'describe("foo foe fum", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 10, line: 1 }],
    },
    {
      code: 'fdescribe(" foo", function () {})',
      output: 'fdescribe("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
    },
    {
      code: "fdescribe(' foo', function () {})",
      output: "fdescribe('foo', function () {})",
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
    },
    {
      code: 'xdescribe(" foo", function () {})',
      output: 'xdescribe("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 11, line: 1 }],
    },
    {
      code: 'it(" foo", function () {})',
      output: 'it("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 4, line: 1 }],
    },
    {
      code: 'it.concurrent(" foo", function () {})',
      output: 'it.concurrent("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 15, line: 1 }],
    },
    {
      code: 'fit(" foo", function () {})',
      output: 'fit("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
    },
    {
      code: 'it.concurrent.skip(" foo", function () {})',
      output: 'it.concurrent.skip("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 20, line: 1 }],
    },
    {
      code: 'fit("foo ", function () {})',
      output: 'fit("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
    },
    {
      code: 'it.concurrent.skip("foo ", function () {})',
      output: 'it.concurrent.skip("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 20, line: 1 }],
    },
    {
      code: dedent`
        import { test as testThat } from '@jest/globals';

        testThat('foo works ', () => {});
      `,
      output: dedent`
        import { test as testThat } from '@jest/globals';

        testThat('foo works', () => {});
      `,
      parserOptions: { sourceType: 'module' },
      errors: [{ messageId: 'accidentalSpace', column: 10, line: 3 }],
    },
    {
      code: 'xit(" foo", function () {})',
      output: 'xit("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 5, line: 1 }],
    },
    {
      code: 'test(" foo", function () {})',
      output: 'test("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
    },
    {
      code: 'test.concurrent(" foo", function () {})',
      output: 'test.concurrent("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
    },
    {
      code: 'test(` foo`, function () {})',
      output: 'test(`foo`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
    },
    {
      code: 'test.concurrent(` foo`, function () {})',
      output: 'test.concurrent(`foo`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
    },
    {
      code: 'test(` foo bar bang`, function () {})',
      output: 'test(`foo bar bang`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
    },
    {
      code: 'test.concurrent(` foo bar bang`, function () {})',
      output: 'test.concurrent(`foo bar bang`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
    },
    {
      code: 'test(` foo bar bang  `, function () {})',
      output: 'test(`foo bar bang`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 1 }],
    },
    {
      code: 'test.concurrent(` foo bar bang  `, function () {})',
      output: 'test.concurrent(`foo bar bang`, function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 17, line: 1 }],
    },
    {
      code: 'xtest(" foo", function () {})',
      output: 'xtest("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 7, line: 1 }],
    },
    {
      code: 'xtest(" foo  ", function () {})',
      output: 'xtest("foo", function () {})',
      errors: [{ messageId: 'accidentalSpace', column: 7, line: 1 }],
    },
    {
      code: dedent`
        describe(' foo', () => {
          it('bar', () => {})
        })
      `,
      output: dedent`
        describe('foo', () => {
          it('bar', () => {})
        })
      `,
      errors: [{ messageId: 'accidentalSpace', column: 10, line: 1 }],
    },
    {
      code: dedent`
        describe('foo', () => {
          it(' bar', () => {})
        })
      `,
      output: dedent`
        describe('foo', () => {
          it('bar', () => {})
        })
      `,
      errors: [{ messageId: 'accidentalSpace', column: 6, line: 2 }],
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
      output: 'describe("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 10, line: 1 }],
    },
    {
      code: 'fdescribe("describe foo", function () {})',
      output: 'fdescribe("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
    },
    {
      code: 'xdescribe("describe foo", function () {})',
      output: 'xdescribe("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
    },
    {
      code: "describe('describe foo', function () {})",
      output: "describe('foo', function () {})",
      errors: [{ messageId: 'duplicatePrefix', column: 10, line: 1 }],
    },
    {
      code: 'fdescribe(`describe foo`, function () {})',
      output: 'fdescribe(`foo`, function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 11, line: 1 }],
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
      output: 'test("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 1 }],
    },
    {
      code: 'xtest("test foo", function () {})',
      output: 'xtest("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 7, line: 1 }],
    },
    {
      code: 'test(`test foo`, function () {})',
      output: 'test(`foo`, function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 1 }],
    },
    {
      code: 'test(`test foo test`, function () {})',
      output: 'test(`foo test`, function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 1 }],
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
      output: 'it("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 4, line: 1 }],
    },
    {
      code: 'fit("it foo", function () {})',
      output: 'fit("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 5, line: 1 }],
    },
    {
      code: 'xit("it foo", function () {})',
      output: 'xit("foo", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 5, line: 1 }],
    },
    {
      code: 'it("it foos it correctly", function () {})',
      output: 'it("foos it correctly", function () {})',
      errors: [{ messageId: 'duplicatePrefix', column: 4, line: 1 }],
    },
  ],
});

ruleTester.run('no-duplicate-prefix ft nested', rule, {
  valid: [
    dedent`
      describe('foo', () => {
        it('bar', () => {})
      })
    `,
    dedent`
      describe('foo', () => {
        it('describes things correctly', () => {})
      })
    `,
  ],
  invalid: [
    {
      code: dedent`
        describe('describe foo', () => {
          it('bar', () => {})
        })
      `,
      output: dedent`
        describe('foo', () => {
          it('bar', () => {})
        })
      `,
      errors: [{ messageId: 'duplicatePrefix', column: 10, line: 1 }],
    },
    {
      code: dedent`
        describe('describe foo', () => {
          it('describes things correctly', () => {})
        })
      `,
      output: dedent`
        describe('foo', () => {
          it('describes things correctly', () => {})
        })
      `,
      errors: [{ messageId: 'duplicatePrefix', column: 10, line: 1 }],
    },
    {
      code: dedent`
        describe('foo', () => {
          it('it bar', () => {})
        })
      `,
      output: dedent`
        describe('foo', () => {
          it('bar', () => {})
        })
      `,
      errors: [{ messageId: 'duplicatePrefix', column: 6, line: 2 }],
    },
  ],
});
