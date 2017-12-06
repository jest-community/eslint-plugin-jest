'use strict';

const RuleTester = require('eslint').RuleTester;
const expectToBeCase = require('../.').expectToBeCase;

const ruleTester = new RuleTester();

const rule = context => {
  return {
    CallExpression(node) {
      if (expectToBeCase(node, null) || expectToBeCase(node, undefined)) {
        context.report({
          message: 'guarded expectToBeCase',
          node: node,
        });
      }
    },
  };
};

ruleTester.run('expect-to-be-null-or-undefined', rule, {
  valid: [
    'expect(null).toBe("something");',
    'expect(something).toBe(somethingElse)',
    "expect(files.name).toBe('file');",
    'expect(result).toBe(true);',
  ],
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
    {
      code: 'expect(null).toBe(undefined);',
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
