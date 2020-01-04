import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../prefer-todo';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: { ecmaVersion: 2015 },
});

ruleTester.run('prefer-todo', rule, {
  valid: [
    'test()',
    'test.concurrent()',
    'test.todo("i need to write this test");',
    'test(obj)',
    'test.concurrent(obj)',
    'fit("foo")',
    'fit.concurrent("foo")',
    'xit("foo")',
    'test("foo", 1)',
    'test("stub", () => expect(1).toBe(1));',
    'test.concurrent("stub", () => expect(1).toBe(1));',
    `
      supportsDone && params.length < test.length
        ? done => test(...params, done)
        : () => test(...params);
    `,
  ],
  invalid: [
    {
      code: `test("i need to write this test");`,
      errors: [{ messageId: 'unimplementedTest' }],
      output: 'test.todo("i need to write this test");',
    },
    {
      code: 'test(`i need to write this test`);',
      errors: [{ messageId: 'unimplementedTest' }],
      output: 'test.todo(`i need to write this test`);',
    },
    {
      code: 'it("foo", function () {})',
      errors: [{ messageId: 'emptyTest' }],
      output: 'it.todo("foo")',
    },
    {
      code: 'it("foo", () => {})',
      errors: [{ messageId: 'emptyTest' }],
      output: 'it.todo("foo")',
    },
    {
      code: `test.skip("i need to write this test", () => {});`,
      errors: [{ messageId: 'emptyTest' }],
      output: 'test.todo("i need to write this test");',
    },
    {
      code: `test.skip("i need to write this test", function() {});`,
      errors: [{ messageId: 'emptyTest' }],
      output: 'test.todo("i need to write this test");',
    },
  ],
});
