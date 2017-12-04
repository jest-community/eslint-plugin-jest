'use strict';
const argument = require('./util').argument;
const expectToBeCase = require('./util').expectToBeCase;
const expectToEqualCase = require('./util').expectToEqualCase;
const method = require('./util').method;

module.exports = context => {
  return {
    CallExpression(node) {
      if (
        expectToBeCase(node, undefined) ||
        expectToEqualCase(node, undefined)
      ) {
        context.report({
          fix(fixer) {
            return [
              fixer.replaceText(method(node), 'toBeUndefined'),
              fixer.remove(argument(node)),
            ];
          },
          message: 'Use toBeUndefined() instead',
          node: method(node),
        });
      }
    },
  };
};
