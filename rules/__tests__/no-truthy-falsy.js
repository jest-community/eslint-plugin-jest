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
          message: 'Use toBe(true) instead',
          column: 14,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(false).toBeFalsy();',
      errors: [
        {
          message: 'Use toBe(false) instead',
          column: 15,
          line: 1,
        },
      ],
    },
  ],
});
