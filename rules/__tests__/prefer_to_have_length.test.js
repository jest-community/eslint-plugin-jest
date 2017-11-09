'use strict';

const RuleTester = require('eslint').RuleTester;
const rules = require('../..').rules;

const ruleTester = new RuleTester();

ruleTester.run('prefer_to_have_length', rules['prefer-to-have-length'], {
  valid: [
    'expect(files).toHaveLength(1);',
    "expect(files.name).toBe('file');",
    'expect(result).toBe(true);',
  ],

  invalid: [
    {
      code: 'expect(files.length).toBe(1);',
      errors: [
        {
          message: 'Use toHaveLength() instead',
          column: 22,
          line: 1,
        },
      ],
      output: 'expect(files).toHaveLength(1);',
    },
    {
      code: 'expect(files.length).toEqual(1);',
      errors: [
        {
          message: 'Use toHaveLength() instead',
          column: 22,
          line: 1,
        },
      ],
      output: 'expect(files).toHaveLength(1);',
    },
  ],
});
