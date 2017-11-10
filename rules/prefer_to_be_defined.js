'use strict';
const argument = require('./util').argument;
const argument2 = require('./util').argument2;
const expectNotToBeCase = require('./util').expectNotToBeCase;
const expectNotToBeUndefinedCase = require('./util').expectNotToBeUndefinedCase;
const expectNotToEqualCase = require('./util').expectNotToEqualCase;
const expectToBeCase = require('./util').expectToBeCase;
const expectToEqualCase = require('./util').expectToEqualCase;
const method = require('./util').method;
const method2 = require('./util').method2;

module.exports = context => {
  return {
    CallExpression(node) {
      if (
        expectNotToBeCase(node, undefined) ||
        expectNotToEqualCase(node, undefined) ||
        expectNotToBeUndefinedCase(node)
      ) {
        context.report({
          fix(fixer) {
            const propertyDot = context
              .getSourceCode()
              .getFirstTokenBetween(
                method(node),
                method2(node),
                token => token.value === '.'
              );
            const fixes = [
              fixer.remove(method(node)),
              fixer.remove(propertyDot),
              fixer.replaceText(method2(node), 'toBeDefined'),
            ];
            if (argument2(node)) {
              fixes.push(fixer.remove(argument2(node)));
            }
            return fixes;
          },
          message: 'Use toBeDefined() instead',
          node: method(node),
        });
      } else if (
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
