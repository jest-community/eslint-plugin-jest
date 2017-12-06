'use strict';
const argument = require('../guards').argument;
const argument2 = require('../guards').argument2;
const expectToBeCase = require('../guards').expectToBeCase;
const expectNotToBeCase = require('../guards').expectNotToBeCase;
const expectToEqualCase = require('../guards').expectToEqualCase;
const expectNotToEqualCase = require('../guards').expectNotToEqualCase;
const method = require('../guards').method;
const method2 = require('../guards').method2;

module.exports = context => {
  return {
    CallExpression(node) {
      const is =
        expectToBeCase(node, undefined) || expectToEqualCase(node, undefined);
      const isNot =
        expectNotToEqualCase(node, undefined) ||
        expectNotToBeCase(node, undefined);

      if (is || isNot) {
        context.report({
          fix(fixer) {
            if (is) {
              return [
                fixer.replaceText(method(node), 'toBeUndefined'),
                fixer.remove(argument(node)),
              ];
            }
            return [
              fixer.replaceText(method2(node), 'toBeUndefined'),
              fixer.remove(argument2(node)),
            ];
          },
          message: 'Use toBeUndefined() instead',
          node: is ? method(node) : method2(node),
        });
      }
    },
  };
};
