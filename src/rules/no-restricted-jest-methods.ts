import { createRule, getAccessorValue, parseJestFnCall } from './utils';

const messages = {
  restrictedJestMethod: 'Use of `{{ restriction }}` is disallowed',
  restrictedJestMethodWithMessage: '{{ message }}',
};

export default createRule<
  [Record<string, string | null>],
  keyof typeof messages
>({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow specific `jest.` methods',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        additionalProperties: {
          type: ['string', 'null'],
        },
      },
    ],
    messages,
  },
  defaultOptions: [{}],
  create(context, [restrictedMethods]) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'jest' || jestFnCall.members.length === 0) {
          return;
        }

        const method = getAccessorValue(jestFnCall.members[0]);

        if (method in restrictedMethods) {
          const message = restrictedMethods[method];

          context.report({
            messageId: message
              ? 'restrictedJestMethodWithMessage'
              : 'restrictedJestMethod',
            data: { message, restriction: method },
            loc: {
              start: jestFnCall.members[0].loc.start,
              end: jestFnCall.members[jestFnCall.members.length - 1].loc.end,
            },
          });
        }
      },
    };
  },
});
