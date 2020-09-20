import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import resolveFrom from 'resolve-from';
import rule from '../valid-describe';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('valid-describe', rule, {
  valid: [
    'describe["each"]()()',
    'describe["each"](() => {})()',
    'describe["each"](() => {})("foo")',
    'describe["each"]()(() => {})',
    'describe["each"]("foo")(() => {})',
    'describe.each([1, 2, 3])("%s", (a, b) => {});',
    'describe("foo", function() {})',
    'describe("foo", () => {})',
    'describe(`foo`, () => {})',
    'xdescribe("foo", () => {})',
    'fdescribe("foo", () => {})',
    'describe.only("foo", () => {})',
    'describe.skip("foo", () => {})',
    dedent`
      describe('foo', () => {
        it('bar', () => {
          return Promise.resolve(42).then(value => {
            expect(value).toBe(42)
          })
        })
      })
    `,
    dedent`
      describe('foo', () => {
        it('bar', async () => {
          expect(await Promise.resolve(42)).toBe(42)
        })
      })
    `,
    dedent`
      describe('foo', () =>
        test('bar', () => {})
      )
    `,
    dedent`
      if (hasOwnProperty(obj, key)) {
      }
    `,
  ],
  invalid: [
    {
      code: 'describe.each()()',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 1 }],
    },
    {
      code: 'describe.each(() => {})()',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 1 }],
    },
    {
      code: 'describe.each(() => {})("foo")',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 25 }],
    },
    {
      code: 'describe.each()(() => {})',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 17 }],
    },
    {
      code: 'describe.each("foo")(() => {})',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 22 }],
    },
    {
      code: 'describe(() => {})',
      errors: [{ messageId: 'nameAndCallback', line: 1, column: 10 }],
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
      code: dedent`
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
        });
      `,
      errors: [{ messageId: 'noAsyncDescribeCallback', line: 5, column: 21 }],
    },
    {
      code: dedent`
        describe('foo', function () {
          return Promise.resolve().then(() => {
            it('breaks', () => {
              throw new Error('Fail')
            })
          })
        })
      `,
      errors: [{ messageId: 'unexpectedReturnInDescribe', line: 2, column: 3 }],
    },
    {
      code: dedent`
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
        { messageId: 'unexpectedReturnInDescribe', line: 2, column: 3 },
        { messageId: 'unexpectedReturnInDescribe', line: 8, column: 5 },
      ],
    },
    {
      code: dedent`
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
        { messageId: 'noAsyncDescribeCallback', line: 1, column: 17 },
        { messageId: 'unexpectedReturnInDescribe', line: 5, column: 5 },
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
