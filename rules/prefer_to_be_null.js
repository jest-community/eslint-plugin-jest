'use strict';
const argument = require('./util').argument;
const expectToBeCase = require('./util').expectToBeCase;
const expectToEqualCase = require('./util').expectToEqualCase;
const method = require('./util').method;

module.exports = context => {
  return {
    CallExpression(node) {
      if (expectToBeCase(node, null) || expectToEqualCase(node, null)) {
        context.report({
          fix(fixer) {
            return [
              fixer.replaceText(method(node), 'toBeNull'),
              fixer.remove(argument(node)),
            ];
          },
          message: 'Use toBeNull() instead',
          node: method(node),
        });
      }
    },
  };
};
