'use strict';

const RuleTester = require('eslint').RuleTester;
const expectToBeCase = require('../.').expectToBeCase;

const ruleTester = new RuleTester();

const rule = context => {
  return {
    CallExpression(node) {
      if (expectToBeCase(node, null)) {
        context.report({
          message: 'guarded expectToBeCase',
          node: node,
        });
      }
    },
  };
};

ruleTester.run('expect-to-be', rule, {
  valid: ['expect(null).toBe("something");'],
  invalid: [
    {
      code: 'expect(null).toBe(null);',
      errors: [
        {
          endColumn: 13,
          column: 1,
          message: 'guarded expectToBeCase',
        },
      ],
    },
  ],
});
