import {
  createRule,
  getAccessorValue,
  parseJestFnCall,
  resolveScope,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow disabled tests',
    },
    messages: {
      missingFunction: 'Test is missing function argument',
      pending: 'Call to pending()',
      pendingSuite: 'Call to pending() within test suite',
      pendingTest: 'Call to pending() within test',
      disabledSuite: 'Disabled test suite',
      disabledTest: 'Disabled test',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    let suiteDepth = 0;
    let testDepth = 0;

    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.type === 'describe') {
          suiteDepth++;
        }

        if (jestFnCall.type === 'test') {
          testDepth++;

          if (
            node.arguments.length < 2 &&
            jestFnCall.members.every(s => getAccessorValue(s) !== 'todo')
          ) {
            context.report({ messageId: 'missingFunction', node });
          }
        }

        if (
          // the only jest functions that are with "x" are "xdescribe", "xtest", and "xit"
          jestFnCall.name.startsWith('x') ||
          jestFnCall.members.some(s => getAccessorValue(s) === 'skip')
        ) {
          context.report({
            messageId:
              jestFnCall.type === 'describe' ? 'disabledSuite' : 'disabledTest',
            node,
          });
        }
      },
      'CallExpression:exit'(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.type === 'describe') {
          suiteDepth--;
        }

        if (jestFnCall.type === 'test') {
          testDepth--;
        }
      },
      'CallExpression[callee.name="pending"]'(node) {
        if (resolveScope(context.getScope(), 'pending')) {
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
    };
  },
});
