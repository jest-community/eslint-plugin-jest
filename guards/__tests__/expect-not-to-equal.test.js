'use strict';

const RuleTester = require('eslint').RuleTester;
const expectNotToEqualCase = require('../.').expectNotToEqualCase;

const ruleTester = new RuleTester();

const rule = context => {
  return {
    CallExpression(node) {
      if (
        expectNotToEqualCase(node, null) ||
        expectNotToEqualCase(node, undefined)
      ) {
        context.report({
          message: 'guarded expectNotToEqualCase',
          node: node,
        });
      }
    },
  };
};

ruleTester.run('expect-not-to-equal-null-or-undefined', rule, {
  valid: [
    'expect(null).not.toEqual("something");',
    'expect(null).not.toEqual(something);',
  ],
  invalid: [
    {
      code: 'expect(null).not.toEqual(null);',
      errors: [
        {
          endColumn: 13,
          column: 1,
          message: 'guarded expectNotToEqualCase',
        },
      ],
    },
    {
      code: 'expect(null).not.toEqual(undefined);',
      errors: [
        {
          endColumn: 13,
          column: 1,
          message: 'guarded expectNotToEqualCase',
        },
      ],
    },
  ],
});
