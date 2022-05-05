import { createRule, isHook } from './utils';

const HooksOrder = [
  'beforeAll',
  'beforeEach',
  'afterEach',
  'afterAll',
] as const;

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest having hooks before any test cases',
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

        if (!isHook(node)) {
          // Reset the previousHookIndex when encountering something different from a hook
          previousHookIndex = -1;
        }

        if (isHook(node)) {
          inHook = true;
          const currentHook = node.callee.name;
          const currentHookIndex = HooksOrder.findIndex(
            name => name === currentHook,
          );

          if (currentHookIndex < previousHookIndex) {
            context.report({
              messageId: 'reorderHooks',
              node,
              data: {
                previousHook: HooksOrder[previousHookIndex],
                currentHook,
              },
            });
          } else {
            previousHookIndex = currentHookIndex;
          }
        }
      },
      'CallExpression:exit'(node) {
        if (!isHook(node) && !inHook) {
          // Reset the previousHookIndex when encountering something different from a hook
          previousHookIndex = -1;
        }

        if (isHook(node)) {
          inHook = false;
        }
      },
    };
  },
});
