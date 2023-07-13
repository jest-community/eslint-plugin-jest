import { createRule, isTypeOfJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Suggest having hooks before any test cases',
    },
    messages: {
      noHookOnTop: 'Hooks should come before test cases',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const hooksContext = [false];

    return {
      CallExpression(node) {
        if (isTypeOfJestFnCall(node, context, ['test'])) {
          hooksContext[hooksContext.length - 1] = true;
        }
        if (
          hooksContext[hooksContext.length - 1] &&
          isTypeOfJestFnCall(node, context, ['hook'])
        ) {
          context.report({
            messageId: 'noHookOnTop',
            node,
          });
        }
        hooksContext.push(false);
      },
      'CallExpression:exit'() {
        hooksContext.pop();
      },
    };
  },
});
