'use strict';

const RuleTester = require('eslint').RuleTester;
const expectToEqualCase = require('../.').expectToEqualCase;

const ruleTester = new RuleTester();

const rule = context => {
  return {
    CallExpression(node) {
      if (expectToEqualCase(node, null) || expectToEqualCase(node, undefined)) {
        context.report({
          message: 'guarded expectToEqualCase',
          node: node,
        });
      }
    },
  };
};

ruleTester.run('expect-to-equal-null-or-undefined', rule, {
  valid: [
    'expect(null).toEqual("something");',
    'expect(something).toEqual(somethingElse)',
  ],
  invalid: [
    {
      code: 'expect(null).toEqual(null);',
      errors: [
        {
          endColumn: 13,
          column: 1,
          message: 'guarded expectToEqualCase',
        },
      ],
    },
    {
      code: 'expect(null).toEqual(undefined);',
      errors: [
        {
          endColumn: 13,
          column: 1,
          message: 'guarded expectToEqualCase',
        },
      ],
    },
  ],
});
