import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../require-top-level-describe';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
  },
});

ruleTester.run('no-standalone-hook', rule, {
  valid: [
    'describe("test suite", () => { test("my test") });',
    'describe("test suite", () => { it("my test") });',
    `
    describe("test suite", () => {
      beforeEach("a", () => {}); 
      describe("b", () => {}); 
      test("c", () => {})
    });
    `,
    'describe("test suite", () => { beforeAll("my beforeAll") });',
    'describe("test suite", () => { afterEach("my afterEach") });',
    'describe("test suite", () => { afterAll("my afterAll") });',
    `
    describe("test suite", () => {
      it("my test", () => {})
      describe("another test suite", () => {
      });
      test("my other test", () => {})
    });
    `,
  ],
  invalid: [
    {
      code: `
      test("my test", () => {})
      describe("test suite", () => {});
      `,
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: `
      test("my test", () => {})
      describe("test suite", () => {
        it("test", () => {})
      });
      `,
      errors: [{ messageId: 'unexpectedTestCase' }],
    },
    {
      code: `
      describe("test suite", () => {});
      afterAll("my test", () => {})
      `,
      errors: [{ messageId: 'unexpectedHook' }],
    },
  ],
});
