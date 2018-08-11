'use strict';

const getDocsUrl = require('./util').getDocsUrl;

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
        const propertyName = node.callee.property && node.callee.property.name;
        if (propertyName === 'toEqual') {
          context.report({
            fix(fixer) {
              return [fixer.replaceText(node.callee.property, 'toStrictEqual')];
            },
            message: 'Use toStrictEqual() instead',
            node: node.callee.property,
          });
        }
      },
    };
  },
};
