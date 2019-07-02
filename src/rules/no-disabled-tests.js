'use strict';

const { getDocsUrl, getNodeName, scopeHasLocalReference } = require('./util');

module.exports = {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      missingFunction: 'Test is missing function argument',
      skippedTestSuite: 'Skipped test suite',
      skippedTest: 'Skipped test',
      pending: 'Call to pending()',
      pendingSuite: 'Call to pending() within test suite',
      pendingTest: 'Call to pending() within test',
      disabledSuite: 'Disabled test suite',
      disabledTest: 'Disabled test',
    },
    schema: [],
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
        context.report({ messageId: 'missingFunction', node });
      },
      CallExpression(node) {
        const functionName = getNodeName(node.callee);

        switch (functionName) {
          case 'describe.skip':
            context.report({ messageId: 'skippedTestSuite', node });
            break;

          case 'it.skip':
          case 'test.skip':
            context.report({ messageId: 'skippedTest', node });
            break;
        }
      },
      'CallExpression[callee.name="pending"]'(node) {
        if (scopeHasLocalReference(context.getScope(), 'pending')) {
          return;
        }

        if (testDepth > 0) {
          context.report({ messageId: 'pendingTest', node });
        } else if (suiteDepth > 0) {
          context.report({ messageId: 'pendingSuite', node });
        } else {
          context.report({ messageId: 'pending', node });
        }
      },
      'CallExpression[callee.name="xdescribe"]'(node) {
        context.report({ messageId: 'disabledSuite', node });
      },
      'CallExpression[callee.name=/^xit|xtest$/]'(node) {
        context.report({ messageId: 'disabledTest', node });
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
