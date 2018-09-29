'use strict';

const RuleTester = require('eslint').RuleTester;
const rule = require('../require-tothrow-message');

const ruleTester = new RuleTester();

ruleTester.run('require-tothrow-message', rule, {
  valid: [
    "expect(function() { a() }).toThrow('a');",
    "expect(function() { a() }).toThrowError('a');",
  ],

  invalid: [
    {
      code: 'expect(function() { a() }).toThrow();',
      errors: [
        { message: 'Add an error message to toThrow()', column: 28, line: 1 },
      ],
    },
    {
      code: 'expect(function() { a() }).toThrowError();',
      errors: [
        {
          message: 'Add an error message to toThrowError()',
          column: 28,
          line: 1,
        },
      ],
    },
  ],
});
