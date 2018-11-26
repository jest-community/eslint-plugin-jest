'use strict';

const { RuleTester } = require('eslint');
const rule = require('../no-truthy-falsy');

const ruleTester = new RuleTester();

ruleTester.run('no-truthy-falsy', rule, {
  valid: [
    'expect(true).toBe(true);',
    'expect(false).toBe(false);',
    'expect("anything").toBe(true);',
    'expect("anything").toBe(false);',
  ],

  invalid: [
    {
      code: 'expect(true).toBeTruthy();',
      errors: [
        {
          message: 'Avoid toBeTruthy',
          column: 14,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(false).not.toBeTruthy();',
      errors: [
        {
          message: 'Avoid toBeTruthy',
          column: 18,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(false).toBeFalsy();',
      errors: [
        {
          message: 'Avoid toBeFalsy',
          column: 15,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(true).not.toBeFalsy();',
      errors: [
        {
          message: 'Avoid toBeFalsy',
          column: 17,
          line: 1,
        },
      ],
    },
  ],
});
