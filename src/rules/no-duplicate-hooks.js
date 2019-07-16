import { getDocsUrl, isDescribe, isHook } from './util';

const newHookContext = () => ({
  beforeAll: 0,
  beforeEach: 0,
  afterAll: 0,
  afterEach: 0,
});

export default {
  meta: {
    docs: {
      url: getDocsUrl(__filename),
    },
    messages: {
      noDuplicateHook: 'Duplicate {{hook}} in describe block',
    },
  },
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
};
