'use strict';

const { getDocsUrl } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      toMatch: 'Use toMatchInlineSnapshot() instead',
      toMatchError: 'Use toThrowErrorMatchingInlineSnapshot() instead',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const propertyName = node.callee.property && node.callee.property.name;
        if (propertyName === 'toMatchSnapshot') {
          context.report({
            fix(fixer) {
              return [
                fixer.replaceText(
                  node.callee.property,
                  'toMatchInlineSnapshot',
                ),
              ];
            },
            messageId: 'toMatch',
            node: node.callee.property,
          });
        } else if (propertyName === 'toThrowErrorMatchingSnapshot') {
          context.report({
            fix(fixer) {
              return [
                fixer.replaceText(
                  node.callee.property,
                  'toThrowErrorMatchingInlineSnapshot',
                ),
              ];
            },
            messageId: 'toMatchError',
            node: node.callee.property,
          });
        }
      },
    };
  },
};
