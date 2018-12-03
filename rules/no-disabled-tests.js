'use strict';

const { getDocsUrl, getNodeName, scopeHasLocalReference } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
  },
  create(context) {
    let suiteDepth = 0;
    let testDepth = 0;

    return {
      'CallExpression[callee.name="describe"]'() {
        suiteDepth++;
      },
      'CallExpression[callee.name=/^(it|test)$/]'() {
        testDepth++;
      },
      'CallExpression[callee.name=/^(it|test)$/][arguments.length<2]'(node) {
        context.report({
          message: 'Test is missing function argument',
          node,
        });
      },
      CallExpression(node) {
        const functionName = getNodeName(node.callee);

        switch (functionName) {
          case 'describe.skip':
            context.report({ message: 'Skipped test suite', node });
            break;

          case 'it.skip':
          case 'test.skip':
            context.report({ message: 'Skipped test', node });
            break;
        }
      },
      'CallExpression[callee.name="pending"]'(node) {
        if (scopeHasLocalReference(context.getScope(), 'pending')) {
          return;
        }

        if (testDepth > 0) {
          context.report({
            message: 'Call to pending() within test',
            node,
          });
        } else if (suiteDepth > 0) {
          context.report({
            message: 'Call to pending() within test suite',
            node,
          });
        } else {
          context.report({
            message: 'Call to pending()',
            node,
          });
        }
      },
      'CallExpression[callee.name="xdescribe"]'(node) {
        context.report({ message: 'Disabled test suite', node });
      },
      'CallExpression[callee.name=/^xit|xtest$/]'(node) {
        context.report({ message: 'Disabled test', node });
      },
      'CallExpression[callee.name="describe"]:exit'() {
        suiteDepth--;
      },
      'CallExpression[callee.name=/^it|test$/]:exit'() {
        testDepth--;
      },
    };
  },
};
