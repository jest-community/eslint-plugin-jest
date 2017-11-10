'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../../').rules;

const ruleTester = new RuleTester();

ruleTester.run('prefer_to_be_defined', rules['prefer-to-be-defined'], {
  valid: [
    'expect(true).toBeDefined();',
    'expect(true).not.toBeDefined();',
    'expect(true).toBe(true);',
    'expect(undefined).toBeUndefined();',
    'expect({}).toEqual({});',
    'expect(null).toEqual(null);',
  ],

  invalid: [
    {
      code: 'expect(true).not.toBe(undefined);',
      errors: [
        {
          message: 'Use toBeDefined() instead',
          column: 14,
          line: 1,
        },
      ],
      output: 'expect(true).toBeDefined();',
    },
    {
      code: 'expect(true).not.toEqual(undefined);',
      errors: [
        {
          message: 'Use toBeDefined() instead',
          column: 14,
          line: 1,
        },
      ],
      output: 'expect(true).toBeDefined();',
    },
    {
      code: 'expect(true).not.toBeUndefined();',
      errors: [
        {
          message: 'Use toBeDefined() instead',
          column: 14,
          line: 1,
        },
      ],
      output: 'expect(true).toBeDefined();',
    },
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
