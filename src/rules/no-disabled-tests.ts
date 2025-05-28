import {
  createRule,
  getAccessorValue,
  getScope,
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
      skippedTest: 'Tests should not be skipped',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (!jestFnCall) {
          return;
        }

        if (jestFnCall.type === 'test') {
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
            messageId: 'skippedTest',
            node,
          });
        }
      },
      'CallExpression[callee.name="pending"]'(node) {
        if (resolveScope(getScope(context, node), 'pending')) {
          return;
        }

        context.report({ messageId: 'skippedTest', node });
      },
    };
  },
});
