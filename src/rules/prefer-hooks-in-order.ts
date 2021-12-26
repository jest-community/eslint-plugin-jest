import { createRule, isDescribeCall, isHook } from './utils';

const HooksOrder = [
  'beforeAll',
  'beforeEach',
  'afterEach',
  'afterAll',
] as const;

type HookName = typeof HooksOrder[number];

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
    const hookContexts: Array<HookName | null> = [null];

    return {
      CallExpression(node) {
        if (!isHook(node)) {
          hookContexts.unshift(null);

          return;
        }

        const { name: currentHook } = node.callee;
        const [previousHook] = hookContexts;

        if (previousHook) {
          if (currentHook === previousHook) {
            return;
          }

          const previousHookIndex = HooksOrder.indexOf(previousHook);
          const currentHookIndex = HooksOrder.indexOf(currentHook);

          if (previousHookIndex <= currentHookIndex) {
            return;
          }

          context.report({
            messageId: 'reorderHooks',
            data: { currentHook, previousHook },
            node,
          });
        }

        hookContexts[0] = currentHook;
      },
      'CallExpression:exit'(node) {
        if (!isHook(node)) {
          hookContexts.shift();
        }
      },
    };
  },
});
