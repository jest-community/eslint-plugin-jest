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
    'beforeEach(() => {})',
    'beforeAll(async () => {})',
    'afterAll(() => {})',
    'afterAll(async function () {})',
    'afterAll(async function () {}, 5)',
  ],
  invalid: [
    {
      code: 'test("something", (...args) => {args[0]();})',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: 'test("something", done => {done();})',
      errors: [
        {
          messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
          messageId: 'noDoneCallback',
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
    {
      code: 'afterEach((...args) => {args[0]();})',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'beforeAll(done => {done();})',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 11,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'beforeAll(() => {return new Promise(done => {done();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'beforeAll(finished => {finished();})',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 11,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'finished' },
              output:
                'beforeAll(() => {return new Promise(finished => {finished();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'beforeEach((done) => {done();})',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 13,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'beforeEach(() => {return new Promise((done) => {done();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'afterAll(done => done())',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 10,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output: 'afterAll(() => new Promise(done => done()))',
            },
          ],
        },
      ],
    },
    {
      code: 'afterEach((done) => done())',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 12,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output: 'afterEach(() => new Promise((done) => done()))',
            },
          ],
        },
      ],
    },
    {
      code: 'beforeAll(function(done) {done();})',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 20,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'beforeAll(function() {return new Promise((done) => {done();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'afterEach(function (done) {done();})',
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 21,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output:
                'afterEach(function () {return new Promise((done) => {done();})})',
            },
          ],
        },
      ],
    },
    {
      code: 'beforeAll(async done => {done();})',
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 17 }],
    },
    {
      code: 'beforeAll(async done => done())',
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 17 }],
    },
    {
      code: 'beforeAll(async function (done) {done();})',
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 27 }],
    },
    {
      code: dedent`
        afterAll(async (done) => {
          await myAsyncTask();
          done();
        });
      `,
      errors: [{ messageId: 'useAwaitInsteadOfCallback', line: 1, column: 17 }],
    },
    {
      code: dedent`
        beforeEach((done) => {
          done();
        });
      `,
      errors: [
        {
          messageId: 'noDoneCallback',
          line: 1,
          column: 13,
          suggestions: [
            {
              messageId: 'suggestWrappingInPromise',
              data: { callback: 'done' },
              output: dedent`
                beforeEach(() => {return new Promise((done) => {
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
