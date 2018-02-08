'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../../').rules;

const ruleTester = new RuleTester();

ruleTester.run('prefer_to_be_undefined', rules['prefer-to-be-undefined'], {
  valid: [
    'expect(undefined).toBeUndefined();',
    'expect(true).not.toBeUndefined();',
    'expect({}).toEqual({});',
    'expect(null).toEqual(null);',
    'expect(something).toBe(somethingElse)',
    'expect(something).toEqual(somethingElse)',
    'expect(something).not.toBe(somethingElse)',
    'expect(something).not.toEqual(somethingElse)',
  ],

  invalid: [
    {
      code: 'expect(undefined).toBe(undefined);',
      errors: [
        {
          message: 'Use toBeUndefined() instead',
          column: 19,
          line: 1,
        },
      ],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect(undefined).toEqual(undefined);',
      errors: [
        {
          message: 'Use toBeUndefined() instead',
          column: 19,
          line: 1,
        },
      ],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toBe(undefined);',
      errors: [
        {
          message: 'Use toBeUndefined() instead',
          column: 24,
          line: 1,
        },
      ],
      output: 'expect("a string").not.toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toEqual(undefined);',
      errors: [
        {
          message: 'Use toBeUndefined() instead',
          column: 24,
          line: 1,
        },
      ],
      output: 'expect("a string").not.toBeUndefined();',
    },
  ],
});
