import { createRule, isTypeOfJestFnCall, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow duplicate setup and teardown hooks',
      recommended: false,
    },
    messages: {
      noDuplicateHook: 'Duplicate {{hook}} in describe block',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const hookContexts: Array<Record<string, number>> = [{}];

    return {
      CallExpression(node) {
        const scope = context.getScope();

        const jestFnCall = parseJestFnCall(node, scope);

        if (jestFnCall?.type === 'describe') {
          hookContexts.push({});
        }

        if (jestFnCall?.type !== 'hook') {
          return;
        }

        const currentLayer = hookContexts[hookContexts.length - 1];

        currentLayer[jestFnCall.name] ||= 0;
        currentLayer[jestFnCall.name] += 1;
        if (currentLayer[jestFnCall.name] > 1) {
          context.report({
            messageId: 'noDuplicateHook',
            data: { hook: jestFnCall.name },
            node,
          });
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfJestFnCall(node, context.getScope(), ['describe'])) {
          hookContexts.pop();
        }
      },
    };
  },
});
