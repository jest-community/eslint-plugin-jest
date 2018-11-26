'use strict';

const {
  getDocsUrl,
  expectCase,
  expectNotCase,
  expectResolveCase,
  expectRejectCase,
  method,
} = require('./util');

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
        if (
          !(
            expectNotCase(node) ||
            expectResolveCase(node) ||
            expectRejectCase(node)
          ) &&
          expectCase(node)
        ) {
          if (method(node).name === 'toBeTruthy') {
            context.report({
              message: 'Use toBe(true) instead',
              node: method(node),
            });
          } else if (method(node).name === 'toBeFalsy') {
            context.report({
              message: 'Use toBe(false) instead',
              node: method(node),
            });
          }
        }
      },
    };
  },
};
