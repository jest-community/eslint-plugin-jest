'use strict';
const expectCase = require('../guards').expectCase;
const expectNotCase = require('../guards').expectNotCase;
const expectResolveCase = require('../guards').expectResolveCase;
const expectRejectCase = require('../guards').expectRejectCase;
const method = require('../guards').method;

module.exports = context => {
  return {
    CallExpression(node) {
      if (
        !(
          expectNotCase(node) ||
          expectResolveCase(node) ||
          expectRejectCase(node)
        ) &&
        expectCase(node) &&
        (method(node).name === 'toBe' || method(node).name === 'toEqual') &&
        node.arguments[0].property &&
        node.arguments[0].property.name === 'length'
      ) {
        const propertyDot = context
          .getSourceCode()
          .getFirstTokenBetween(
            node.arguments[0].object,
            node.arguments[0].property,
            token => token.value === '.'
          );
        context.report({
          fix(fixer) {
            return [
              fixer.remove(propertyDot),
              fixer.remove(node.arguments[0].property),
              fixer.replaceText(method(node), 'toHaveLength'),
            ];
          },
          message: 'Use toHaveLength() instead',
          node: method(node),
        });
      }
    },
  };
};
