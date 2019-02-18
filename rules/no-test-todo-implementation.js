'use strict';

const { getDocsUrl, getNodeName, isFunction } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      'no-test-todo-implementation':
        'Tests with .todo should not provide an implementation',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const functionName = getNodeName(node.callee);
        const hasTodoModifier =
          functionName === 'it.todo' || functionName === 'test.todo';
        const hasImplementation =
          node.arguments[1] && isFunction(node.arguments[1]);

        if (hasTodoModifier && hasImplementation) {
          context.report({
            node,
            messageId: 'no-test-todo-implementation',
          });
        }
      },
    };
  },
};
