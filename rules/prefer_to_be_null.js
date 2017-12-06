'use strict';
const argument = require('../guards').argument;
const argument2 = require('../guards').argument2;
const expectToBeCase = require('../guards').expectToBeCase;
const expectToEqualCase = require('../guards').expectToEqualCase;
const expectNotToEqualCase = require('../guards').expectNotToEqualCase;
const expectNotToBeCase = require('../guards').expectNotToBeCase;
const method = require('../guards').method;
const method2 = require('../guards').method2;

module.exports = context => {
  return {
    CallExpression(node) {
      const is = expectToBeCase(node, null) || expectToEqualCase(node, null);
      const isNot =
        expectNotToEqualCase(node, null) || expectNotToBeCase(node, null);

      if (is || isNot) {
        context.report({
          fix(fixer) {
            if (is) {
              return [
                fixer.replaceText(method(node), 'toBeNull'),
                fixer.remove(argument(node)),
              ];
            }
            return [
              fixer.replaceText(method2(node), 'toBeNull'),
              fixer.remove(argument2(node)),
            ];
          },
          message: 'Use toBeNull() instead',
          node: is ? method(node) : method2(node),
        });
      }
    },
  };
};
