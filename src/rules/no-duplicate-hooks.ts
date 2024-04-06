import { createRule, isTypeOfJestFnCall, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow duplicate setup and teardown hooks',
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
        const jestFnCall = parseJestFnCall(node, context);

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
        if (isTypeOfJestFnCall(node, context, ['describe'])) {
          hookContexts.pop();
        }
      },
    };
  },
});
