import { createRule, isDescribe, isHook } from './utils';

const newHookContext = () => ({
  beforeAll: 0,
  beforeEach: 0,
  afterAll: 0,
  afterEach: 0,
});

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
    const hookContexts = [newHookContext()];

    return {
      CallExpression(node) {
        if (isDescribe(node)) {
          hookContexts.push(newHookContext());
        }

        if (isHook(node)) {
          const currentLayer = hookContexts[hookContexts.length - 1];

          currentLayer[node.callee.name] += 1;
          if (currentLayer[node.callee.name] > 1) {
            context.report({
              messageId: 'noDuplicateHook',
              data: { hook: node.callee.name },
              node,
            });
          }
        }
      },
      'CallExpression:exit'(node) {
        if (isDescribe(node)) {
          hookContexts.pop();
        }
      },
    };
  },
});
