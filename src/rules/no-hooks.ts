import { type HookName, createRule, parseJestFnCall } from './utils';

export default createRule<
  [Partial<{ allow: readonly HookName[] }>],
  'unexpectedHook'
>({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow setup and teardown hooks',
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
        const jestFnCall = parseJestFnCall(node, context);

        if (
          jestFnCall?.type === 'hook' &&
          !allow.includes(jestFnCall.name as HookName)
        ) {
          context.report({
            node,
            messageId: 'unexpectedHook',
            data: { hookName: jestFnCall.name },
          });
        }
      },
    };
  },
});
