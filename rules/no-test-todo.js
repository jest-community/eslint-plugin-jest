'use strict';

const { getDocsUrl, getNodeName } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      'no-test-todo': 'Unexpected test modifier .todo',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const functionName = getNodeName(node.callee);

        if (functionName === 'test.todo' || functionName === 'it.todo') {
          context.report({ messageId: 'no-test-todo', node });
        }
      },
    };
  },
};
