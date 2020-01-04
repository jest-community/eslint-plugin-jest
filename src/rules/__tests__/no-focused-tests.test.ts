import { TSESLint } from '@typescript-eslint/experimental-utils';
import resolveFrom from 'resolve-from';
import rule from '../no-focused-tests';

const ruleTester = new TSESLint.RuleTester({
  parser: resolveFrom(require.resolve('eslint'), 'espree'),
  parserOptions: {
    ecmaVersion: 6,
  },
});

ruleTester.run('no-focused-tests', rule, {
  valid: [
    'describe()',
    'it()',
    'describe.skip()',
    'it.skip()',
    'it.concurrent.skip()',
    'test()',
    'test.skip()',
    'test.concurrent.skip()',
    'var appliedOnly = describe.only; appliedOnly.apply(describe)',
    'var calledOnly = it.only; calledOnly.call(it)',
    'it.each()()',
    'it.each`table`()',
    'test.each()()',
    'test.each`table`()',
    'test.concurrent()',
  ],

  invalid: [
    {
      code: 'describe.only()',
      errors: [{ messageId: 'focusedTest', column: 10, line: 1 }],
    },
    {
      code: 'describe.only.each()',
      errors: [{ messageId: 'focusedTest', column: 10, line: 1 }],
    },
    {
      code: 'describe.only.each`table`()',
      errors: [{ messageId: 'focusedTest', column: 10, line: 1 }],
    },
    {
      code: 'describe["only"]()',
      errors: [{ messageId: 'focusedTest', column: 10, line: 1 }],
    },
    {
      code: 'it.only()',
      errors: [{ messageId: 'focusedTest', column: 4, line: 1 }],
    },
    {
      code: 'it.concurrent.only()',
      errors: [{ messageId: 'focusedTest', column: 4, line: 1 }],
    },
    {
      code: 'it.only.each()',
      errors: [{ messageId: 'focusedTest', column: 4, line: 1 }],
    },
    {
      code: 'it.only.each`table`()',
      errors: [{ messageId: 'focusedTest', column: 4, line: 1 }],
    },
    {
      code: 'it["only"]()',
      errors: [{ messageId: 'focusedTest', column: 4, line: 1 }],
    },
    {
      code: 'test.only()',
      errors: [{ messageId: 'focusedTest', column: 6, line: 1 }],
    },
    {
      code: 'test.concurrent.only()',
      errors: [{ messageId: 'focusedTest', column: 6, line: 1 }],
    },
    {
      code: 'test.only.each()',
      errors: [{ messageId: 'focusedTest', column: 6, line: 1 }],
    },
    {
      code: 'test.only.each`table`()',
      errors: [{ messageId: 'focusedTest', column: 6, line: 1 }],
    },
    {
      code: 'test["only"]()',
      errors: [{ messageId: 'focusedTest', column: 6, line: 1 }],
    },
    {
      code: 'fdescribe()',
      errors: [{ messageId: 'focusedTest', column: 1, line: 1 }],
    },
    {
      code: 'fit()',
      errors: [{ messageId: 'focusedTest', column: 1, line: 1 }],
    },
    {
      code: 'fit.each()',
      errors: [{ messageId: 'focusedTest', column: 1, line: 1 }],
    },
    {
      code: 'fit.each`table`()',
      errors: [{ messageId: 'focusedTest', column: 1, line: 1 }],
    },
    {
      code: 'ftest.each`table`()',
      errors: [{ messageId: 'focusedTest', column: 1, line: 1 }],
    },
  ],
});
