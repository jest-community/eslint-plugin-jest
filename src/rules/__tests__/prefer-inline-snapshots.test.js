'use strict';

const { RuleTester } = require('eslint');
const rule = require('../prefer-inline-snapshots');

const ruleTester = new RuleTester();

ruleTester.run('prefer-inline-snapshots', rule, {
  valid: [
    'expect(something).toMatchInlineSnapshot();',
    'expect(something).toThrowErrorMatchingInlineSnapshot();',
  ],
  invalid: [
    {
      code: 'expect(something).toMatchSnapshot();',
      errors: [{ messageId: 'toMatch', column: 19, line: 1 }],
      output: 'expect(something).toMatchInlineSnapshot();',
    },
    {
      code: 'expect(something).toThrowErrorMatchingSnapshot();',
      errors: [{ messageId: 'toMatchError', column: 19, line: 1 }],
      output: 'expect(something).toThrowErrorMatchingInlineSnapshot();',
    },
  ],
});
