'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-focused-tests');

const ruleTester = new RuleTester();

ruleTester.run('no-focused-tests', rule, {
  valid: [
    'describe()',
    'it()',
    'describe.skip()',
    'it.skip()',
    'test()',
    'test.skip()',
    'var appliedOnly = describe.only; appliedOnly.apply(describe)',
    'var calledOnly = it.only; calledOnly.call(it)',
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
      code: 'describe["only"]()',
      errors: [{ messageId: 'focusedTest', column: 10, line: 1 }],
    },
    {
      code: 'it.only()',
      errors: [{ messageId: 'focusedTest', column: 4, line: 1 }],
    },
    {
      code: 'it.only.each()',
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
      code: 'test.only.each()',
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
  ],
});
