'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../../').rules;

const ruleTester = new RuleTester();

ruleTester.run('prefer_to_be_undefined', rules['prefer-to-be-undefined'], {
  valid: [
    'expect(undefined).toBeUndefined();',
    'expect(undefined).not.toBeUndefined();',
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
  ],
});
