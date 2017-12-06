'use strict';

const RuleTester = require('eslint').RuleTester;
const expectNotToBeCase = require('../.').expectNotToBeCase;

const ruleTester = new RuleTester();

const rule = context => {
  return {
    CallExpression(node) {
      if (expectNotToBeCase(node, null)) {
        context.report({
          message: 'guarded expectNotToBeCase',
          node: node,
        });
      }
    },
  };
};

ruleTester.run('expect-not-to-be', rule, {
  valid: ['expect(null).not.toBe("something");'],
  invalid: [
    {
      code: 'expect(null).not.toBe(null);',
      errors: [
        {
          endColumn: 13,
          column: 1,
          message: 'guarded expectNotToBeCase',
        },
      ],
    },
  ],
});
