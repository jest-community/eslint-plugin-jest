import { createRule, isTypeOfJestFnCall, parseJestFnCall } from './utils';

const HooksOrder = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll'];

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prefer having hooks in a consistent order',
      recommended: false,
    },
    messages: {
      reorderHooks: `\`{{ currentHook }}\` hooks should be before any \`{{ previousHook }}\` hooks`,
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    let previousHookIndex = -1;
    let inHook = false;

    return {
      CallExpression(node) {
        if (inHook) {
          // Ignore everything that is passed into a hook
          return;
        }

        const jestFnCall = parseJestFnCall(node, context.getScope());

        if (jestFnCall?.type !== 'hook') {
          // Reset the previousHookIndex when encountering something different from a hook
          previousHookIndex = -1;

          return;
        }

        inHook = true;
        const currentHook = jestFnCall.name;
        const currentHookIndex = HooksOrder.indexOf(currentHook);

        if (currentHookIndex < previousHookIndex) {
          context.report({
            messageId: 'reorderHooks',
            node,
            data: {
              previousHook: HooksOrder[previousHookIndex],
              currentHook,
            },
          });

          return;
        }

        previousHookIndex = currentHookIndex;
      },
      'CallExpression:exit'(node) {
        if (isTypeOfJestFnCall(node, context.getScope(), ['hook'])) {
          inHook = false;

          return;
        }

        if (inHook) {
          return;
        }

        // Reset the previousHookIndex when encountering something different from a hook
        previousHookIndex = -1;
      },
    };
  },
});
