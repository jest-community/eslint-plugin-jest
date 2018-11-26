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
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          expectCase(node) ||
          expectNotCase(node) ||
          expectResolveCase(node) ||
          expectRejectCase(node)
        ) {
          const targetNode = expectNotCase(node) ? node.parent : node;
          const methodName = method(targetNode).name;

          if (methodName === 'toBeTruthy') {
            context.report({
              message: 'Avoid toBeTruthy',
              node: method(targetNode),
            });
          } else if (methodName === 'toBeFalsy') {
            context.report({
              message: 'Avoid toBeFalsy',
              node: method(targetNode),
            });
          }
        }
      },
    };
  },
};
