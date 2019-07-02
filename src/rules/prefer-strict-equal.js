'use strict';

const { expectCase, getDocsUrl, method } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      useToStrictEqual: 'Use toStrictEqual() instead',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!expectCase(node)) {
          return;
        }

        const propertyName = method(node) && method(node).name;

        if (propertyName === 'toEqual') {
          context.report({
            fix(fixer) {
              return [fixer.replaceText(method(node), 'toStrictEqual')];
            },
            messageId: 'useToStrictEqual',
            node: method(node),
          });
        }
      },
    };
  },
};
