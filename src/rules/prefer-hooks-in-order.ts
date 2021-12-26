import { createRule, isHook } from './utils';

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
    // const hookContexts = [false];
    // let previousHook: HookName | null = null;

    return {
      CallExpression(node) {
        // on enter:
        //   if "is hook:
        //     if "have seen a previous hook":
        //       if "previous hook name is different":
        //         - compare hook orders
        //         - update previous hook name
        //   else:
        //     - mark previous hook name as null
        //
        // ----------
        // if "hook":
        //  if: "have seen a previous hook"
        //    if: previous hook name is different
        //    - check hook order
        //    - update previous hook name
        // else:
        //    - mark previous hook name as null
        if (!isHook(node)) {
          hookContexts.unshift(null);
          // hookContexts.unshift(true);

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

        // previousHook = currentHook;
        hookContexts.unshift(currentHook);
        // hookContexts[0] = currentHook;
      },
      'CallExpression:exit'(node) {
        // if (!isHook(node)) {
        hookContexts.shift();
        // }
      },
    };
  },
});
