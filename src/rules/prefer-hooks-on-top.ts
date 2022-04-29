import { createRule, isHook, isTestCaseCall } from './utils';

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
    const scope = context.getScope();
    const hooksContext = [false];

    return {
      CallExpression(node) {
        if (!isHook(node) && isTestCaseCall(node, scope)) {
          hooksContext[hooksContext.length - 1] = true;
        }
        if (hooksContext[hooksContext.length - 1] && isHook(node)) {
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
