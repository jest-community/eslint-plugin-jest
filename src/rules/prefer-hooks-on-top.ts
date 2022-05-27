import { createRule, isTypeOfJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest having hooks before any test cases',
      recommended: false,
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
        const scope = context.getScope();

        if (isTypeOfJestFnCall(node, scope, ['test'])) {
          hooksContext[hooksContext.length - 1] = true;
        }
        if (
          hooksContext[hooksContext.length - 1] &&
          isTypeOfJestFnCall(node, scope, ['hook'])
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
