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
          const targetNode =
            node.parent.parent.type === 'MemberExpression' ? node.parent : node;
          const methodName = method(targetNode).name;

          if (methodName === 'toBeTruthy' || methodName === 'toBeFalsy') {
            context.report({
              data: { function: methodName },
              message: 'Avoid {{function}}',
              node: method(targetNode),
            });
          }
        }
      },
    };
  },
};
