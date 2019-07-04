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
    messages: {
      avoidMessage: 'Avoid {{methodName}}',
    },
    schema: [],
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
          const targetNode =
            node.parent.parent.type === 'MemberExpression' ? node.parent : node;

          const methodNode = method(targetNode);
          const { name: methodName } = methodNode;

          if (methodName === 'toBeTruthy' || methodName === 'toBeFalsy') {
            context.report({
              data: { methodName },
              messageId: 'avoidMessage',
              node: methodNode,
            });
          }
        }
      },
    };
  },
};
