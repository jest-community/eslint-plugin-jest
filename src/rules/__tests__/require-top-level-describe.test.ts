import { TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import rule from '../require-top-level-describe';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('require-top-level-describe', rule, {
  valid: [
    'it.each()',
    'describe("test suite", () => { test("my test") });',
    'describe("test suite", () => { it("my test") });',
    dedent`
      describe("test suite", () => {
        beforeEach("a", () => {});
        describe("b", () => {});
        test("c", () => {})
      });
    `,
    'describe("test suite", () => { beforeAll("my beforeAll") });',
    'describe("test suite", () => { afterEach("my afterEach") });',
    'describe("test suite", () => { afterAll("my afterAll") });',
    dedent`
      describe("test suite", () => {
        it("my test", () => {})
        describe("another test suite", () => {
        });
        test("my other test", () => {})
      });
    `,
    'foo()',
    'describe.each([1, true])("trues", value => { it("an it", () => expect(value).toBe(true) ); });',
    dedent`
      describe('%s', () => {
        it('is fine', () => {
          //
        });
      });

      describe.each('world')('%s', () => {
        it.each([1, 2, 3])('%n', () => {
          //
        });
      });
    `,
    dedent`
      describe.each('hello')('%s', () => {
        it('is fine', () => {
          //
        });
      });

      describe.each('world')('%s', () => {
        it.each([1, 2, 3])('%n', () => {
          //
        });
      });
    `,
  ],
  invalid: [
    {
      code: 'beforeEach("my test", () => {})',
      errors: [{ messageId: 'unexpectedHook' }],
    },
    {
      code: dedent`
        test("my test", () => {})
        describe("test suite", () => {});
      `,
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: dedent`
        test("my test", () => {})
        describe("test suite", () => {
          it("test", () => {})
        });
      `,
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: dedent`
        describe("test suite", () => {});
        afterAll("my test", () => {})
      `,
      errors: [{ messageId: 'unexpectedHook' }],
    },
    {
      code: dedent`
        import { describe, afterAll as onceEverythingIsDone } from '@jest/globals';

        describe("test suite", () => {});
        onceEverythingIsDone("my test", () => {})
      `,
      parserOptions: { sourceType: 'module' },
      errors: [{ messageId: 'unexpectedHook' }],
    },
    {
      code: "it.skip('test', () => {});",
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: "it.each([1, 2, 3])('%n', () => {});",
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: "it.skip.each([1, 2, 3])('%n', () => {});",
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: "it.skip.each``('%n', () => {});",
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: "it.each``('%n', () => {});",
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
  ],
});

ruleTester.run(
  'require-top-level-describe (enforce number of describes)',
  rule,
  {
    valid: [
      'describe("test suite", () => { test("my test") });',
      'foo()',
      'describe.each([1, true])("trues", value => { it("an it", () => expect(value).toBe(true) ); });',
      dedent`
        describe('one', () => {});
        describe('two', () => {});
        describe('three', () => {});
      `,
      {
        code: dedent`
          describe('one', () => {
            describe('two', () => {});
            describe('three', () => {});
          });
        `,
        options: [{ maxNumberOfTopLevelDescribes: 1 }],
      },
    ],
    invalid: [
      {
        code: dedent`
          describe('one', () => {});
          describe('two', () => {});
          describe('three', () => {});
        `,
        options: [{ maxNumberOfTopLevelDescribes: 2 }],
        errors: [{ messageId: 'tooManyDescribes', line: 3 }],
      },
      {
        code: dedent`
          describe('one', () => {
            describe('one (nested)', () => {});
            describe('two (nested)', () => {});
          });
          describe('two', () => {
            describe('one (nested)', () => {});
            describe('two (nested)', () => {});
            describe('three (nested)', () => {});
          });
          describe('three', () => {
            describe('one (nested)', () => {});
            describe('two (nested)', () => {});
            describe('three (nested)', () => {});
          });
        `,
        options: [{ maxNumberOfTopLevelDescribes: 2 }],
        errors: [{ messageId: 'tooManyDescribes', line: 10 }],
      },
      {
        code: dedent`
          import {
            describe as describe1,
            describe as describe2,
            describe as describe3,
          } from '@jest/globals';

          describe1('one', () => {
            describe('one (nested)', () => {});
            describe('two (nested)', () => {});
          });
          describe2('two', () => {
            describe('one (nested)', () => {});
            describe('two (nested)', () => {});
            describe('three (nested)', () => {});
          });
          describe3('three', () => {
            describe('one (nested)', () => {});
            describe('two (nested)', () => {});
            describe('three (nested)', () => {});
          });
        `,
        options: [{ maxNumberOfTopLevelDescribes: 2 }],
        parserOptions: { sourceType: 'module' },
        errors: [{ messageId: 'tooManyDescribes', line: 16 }],
      },
      {
        code: dedent`
          describe('one', () => {});
          describe('two', () => {});
          describe('three', () => {});
        `,
        options: [{ maxNumberOfTopLevelDescribes: 1 }],
        errors: [
          { messageId: 'tooManyDescribes', line: 2 },
          { messageId: 'tooManyDescribes', line: 3 },
        ],
      },
    ],
  },
);
