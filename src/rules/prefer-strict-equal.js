'use strict';

const { expectCase, getDocsUrl, method } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    fixable: 'code',
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
            message: 'Use toStrictEqual() instead',
            node: method(node),
          });
        }
      },
    };
  },
};
