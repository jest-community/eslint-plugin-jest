'use strict';

const { RuleTester } = require('eslint');
const rule = require('../valid-describe');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 8,
  },
});

ruleTester.run('valid-describe', rule, {
  valid: [
    'describe("foo", function() {})',
    'describe("foo", () => {})',
    'describe(`foo`, () => {})',
    'xdescribe("foo", () => {})',
    'fdescribe("foo", () => {})',
    'describe.only("foo", () => {})',
    'describe.skip("foo", () => {})',
    `
    describe('foo', () => {
      it('bar', () => {
        return Promise.resolve(42).then(value => {
          expect(value).toBe(42)
        })
      })
    })
    `,
    `
    describe('foo', () => {
      it('bar', async () => {
        expect(await Promise.resolve(42)).toBe(42)
      })
    })
    `,
    `
    describe('foo', () =>
      test('bar', () => {})
    )
    `,
  ],
  invalid: [
    {
      code: 'describe(() => {})',
      errors: [
        { messageId: 'firstArgumentMustBeName', line: 1, column: 10 },
        { messageId: 'nameAndCallback', line: 1, column: 10 },
      ],
    },
    {
      code: 'describe("foo")',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 10 }],
    },
    {
      code: 'describe("foo", "foo2")',
      errors: [
        { messageId: 'secondArgumentMustBeFunction', line: 1, column: 10 },
      ],
    },
    {
      code: 'describe()',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 1 }],
    },
    {
      code: 'describe("foo", async () => {})',
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 1, column: 17 }],
    },
    {
      code: 'describe("foo", async function () {})',
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 1, column: 17 }],
    },
    {
      code: 'xdescribe("foo", async function () {})',
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 1, column: 18 }],
    },
    {
      code: 'fdescribe("foo", async function () {})',
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 1, column: 18 }],
    },
    {
      code: 'describe.only("foo", async function () {})',
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 1, column: 22 }],
    },
    {
      code: 'describe.skip("foo", async function () {})',
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 1, column: 22 }],
    },
    {
      code: `
      describe('sample case', () => {
        it('works', () => {
          expect(true).toEqual(true);
        });
        describe('async', async () => {
          await new Promise(setImmediate);
          it('breaks', () => {
            throw new Error('Fail');
          });
        });
      });`,
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 6, column: 27 }],
    },
    {
      code: `
      describe('foo', function () {
        return Promise.resolve().then(() => {
          it('breaks', () => {
            throw new Error('Fail')
          })
        })
      })
      `,
      errors: [{ messageId: 'unexpectedReturnInDescribe', line: 3, column: 9 }],
    },
    {
      code: `
      describe('foo', () => {
        return Promise.resolve().then(() => {
          it('breaks', () => {
            throw new Error('Fail')
          })
        })
        describe('nested', () => {
          return Promise.resolve().then(() => {
            it('breaks', () => {
              throw new Error('Fail')
            })
          })
        })
      })
      `,
      errors: [
        { messageId: 'unexpectedReturnInDescribe', line: 3, column: 9 },
        { messageId: 'unexpectedReturnInDescribe', line: 9, column: 11 },
      ],
    },
    {
      code: `
      describe('foo', async () => {
        await something()
        it('does something')
        describe('nested', () => {
          return Promise.resolve().then(() => {
            it('breaks', () => {
              throw new Error('Fail')
            })
          })
        })
      })
      `,
      errors: [
        { messageId: 'noAsyncDescribeCallback', line: 2, column: 23 },
        { messageId: 'unexpectedReturnInDescribe', line: 6, column: 11 },
      ],
    },
    {
      code: 'describe("foo", done => {})',
      errors: [
        { messageId: 'unexpectedDescribeArgument', line: 1, column: 17 },
      ],
    },
    {
      code: 'describe("foo", function (done) {})',
      errors: [
        { messageId: 'unexpectedDescribeArgument', line: 1, column: 27 },
      ],
    },
    {
      code: 'describe("foo", function (one, two, three) {})',
      errors: [
        { messageId: 'unexpectedDescribeArgument', line: 1, column: 27 },
      ],
    },
    {
      code: 'describe("foo", async function (done) {})',
      errors: [
        { messageId: 'noAsyncDescribeCallback', line: 1, column: 17 },
        { messageId: 'unexpectedDescribeArgument', line: 1, column: 33 },
      ],
    },
  ],
});
