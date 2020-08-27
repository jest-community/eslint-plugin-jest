import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../no-done-callback';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('no-done-callback', rule, {
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
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 19,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'test("something", () => {return new Promise(done => {done();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'test("something", finished => {finished();})',
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 19,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'finished' },
              output:
                'test("something", () => {return new Promise(finished => {finished();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'test("something", (done) => {done();})',
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 20,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'test("something", () => {return new Promise((done) => {done();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'test("something", done => done())',
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 19,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output: 'test("something", () => new Promise(done => done()))',
            },
          ],
        },
      ],
    },
    {
      code: 'test("something", (done) => done())',
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 20,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output: 'test("something", () => new Promise((done) => done()))',
            },
          ],
        },
      ],
    },
    {
      code: 'test("something", function(done) {done();})',
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 28,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'test("something", function() {return new Promise((done) => {done();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'test("something", function (done) {done();})',
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 29,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'test("something", function () {return new Promise((done) => {done();})})',
            },
          ],
        },
      ],
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
      code: dedent`
        test('my test', async (done) => {
          await myAsyncTask();
          expect(true).toBe(false);
          done();
        });
      `,
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 24 }],
    },
    {
      code: dedent`
        test('something', (done) => {
          done();
        });
      `,
      errors: [
        {
          messageId: 'illegalTestCallback',
          line: 1,
          column: 20,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output: dedent`
                test('something', () => {return new Promise((done) => {
                  done();
                })});
              `,
            },
          ],
        },
      ],
    },
  ],
});
