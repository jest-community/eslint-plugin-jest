import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../require-top-level-describe';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('require-top-level-describe', rule, {
  valid: [
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
  ],
});
