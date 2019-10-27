import { HookName, createRule, isHook } from './utils';

export default createRule<
  [Partial<{ allow: readonly HookName[] }>],
  'unexpectedHook'
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow setup and teardown hooks',
      recommended: false,
    },
    messages: {
      unexpectedHook: "Unexpected '{{ hookName }}' hook",
    },
    schema: [
      {
        type: 'object',
        properties: {
          allow: {
            type: 'array',
            contains: ['beforeAll', 'beforeEach', 'afterAll', 'afterEach'],
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [{ allow: [] }],
  create(context, [{ allow = [] }]) {
    return {
      CallExpression(node) {
        if (isHook(node) && !allow.includes(node.callee.name)) {
          context.report({
            node,
            messageId: 'unexpectedHook',
            data: { hookName: node.callee.name },
          });
        }
      },
    };
  },
});
