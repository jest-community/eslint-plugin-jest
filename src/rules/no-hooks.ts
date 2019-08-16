import { HookName, createRule, isHook } from './utils';

export default createRule({
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
  defaultOptions: [{ allow: [] } as { allow: readonly HookName[] }],
  create(context, [{ allow }]) {
    const whitelistedHookNames = allow.reduce((hashMap, value) => {
      hashMap[value] = true;
      return hashMap;
    }, Object.create(null));

    const isWhitelisted = (node: { callee: { name: string } }) =>
      whitelistedHookNames[node.callee.name];

    return {
      CallExpression(node) {
        if (isHook(node) && !isWhitelisted(node)) {
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
