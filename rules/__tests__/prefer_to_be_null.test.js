'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../../').rules;

const ruleTester = new RuleTester();

ruleTester.run('prefer_to_be_null', rules['prefer-to-be-null'], {
  valid: [
    'expect(null).toBeNull();',
    'expect(null).toEqual();',
    "expect(something).toEqual('a string');",
  ],

  invalid: [
    {
      code: 'expect(null).toBe(null);',
      errors: [
        {
          message: 'Use toBeNull() instead',
          column: 14,
          line: 1,
        },
      ],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect(null).toEqual(null);',
      errors: [
        {
          message: 'Use toBeNull() instead',
          column: 14,
          line: 1,
        },
      ],
      output: 'expect(null).toBeNull();',
    },
  ],
});
