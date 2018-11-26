'use strict';

const {
  getDocsUrl,
  expectCase,
  expectResolveCase,
  expectRejectCase,
  method,
} = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          !(expectResolveCase(node) || expectRejectCase(node)) &&
          expectCase(node)
        ) {
          const methodName = method(node).name;
          if (methodName === 'toBeTruthy') {
            context.report({
              message: 'Avoid toBeTruthy',
              node: method(node),
            });
          } else if (methodName === 'toBeFalsy') {
            context.report({
              message: 'Avoid toBeFalsy',
              node: method(node),
            });
          }
        }
      },
    };
  },
};
