import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-test-callback';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('no-test-callback', rule, {
  valid: [
    'test("something", () => {})',
    'test("something", async () => {})',
    'test("something", function() {})',
    'test("something", async function () {})',
    'test("something", someArg)',
  ],
  invalid: [
    {
      code: 'test("something", (...args) => {args[0]();})',
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: 'test("something", done => {done();})',
      errors: [{ messageId: 'illegalTestCallback', line: 1, column: 19 }],
      output:
        'test("something", () => {return new Promise(done => {done();})})',
    },
    {
      code: 'test("something", (done) => {done();})',
      errors: [{ messageId: 'illegalTestCallback', line: 1, column: 20 }],
      output:
        'test("something", () => {return new Promise((done) => {done();})})',
    },
    {
      code: 'test("something", done => done())',
      errors: [{ messageId: 'illegalTestCallback', line: 1, column: 19 }],
      output: 'test("something", () => new Promise(done => done()))',
    },
    {
      code: 'test("something", (done) => done())',
      errors: [{ messageId: 'illegalTestCallback', line: 1, column: 20 }],
      output: 'test("something", () => new Promise((done) => done()))',
    },
    {
      code: 'test("something", function(done) {done();})',
      errors: [{ messageId: 'illegalTestCallback', line: 1, column: 28 }],
      output:
        'test("something", function() {return new Promise((done) => {done();})})',
    },
    {
      code: 'test("something", function (done) {done();})',
      errors: [{ messageId: 'illegalTestCallback', line: 1, column: 29 }],
      output:
        'test("something", function () {return new Promise((done) => {done();})})',
    },
    {
      code: 'test("something", async done => {done();})',
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 25 }],
    },
    {
      code: 'test("something", async done => done())',
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 25 }],
    },
    {
      code: 'test("something", async function (done) {done();})',
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 35 }],
    },
    {
      code: `
      test('my test', async (done) => {
        await myAsyncTask();
        expect(true).toBe(false);
        done();
      });
      `,
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 2, column: 30 }],
    },
    {
      code: `
      test('something', (done) => {
        done();
      });
      `,
      errors: [{ messageId: 'illegalTestCallback', line: 2, column: 26 }],
      output: `
      test('something', () => {return new Promise((done) => {
        done();
      })});
      `,
    },
  ],
});
