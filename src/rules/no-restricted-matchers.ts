import { createRule, getAccessorValue, parseJestFnCall } from './utils';

export default createRule<
  [Record<string, string | null>],
  'restrictedChain' | 'restrictedChainWithMessage'
>({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow specific matchers & modifiers',
      recommended: false,
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
    messages: {
      restrictedChain: 'Use of `{{ restriction }}` is disallowed',
      restrictedChainWithMessage: '{{ message }}',
    },
  },
  defaultOptions: [{}],
  create(context, [restrictedChains]) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const chain = jestFnCall.members
          .map(nod => getAccessorValue(nod))
          .join('.');

        for (const [restriction, message] of Object.entries(restrictedChains)) {
          if (chain.startsWith(restriction)) {
            context.report({
              messageId: message
                ? 'restrictedChainWithMessage'
                : 'restrictedChain',
              data: { message, restriction },
              loc: {
                start: jestFnCall.members[0].loc.start,
                end: jestFnCall.members[jestFnCall.members.length - 1].loc.end,
              },
            });

            break;
          }
        }
      },
    };
  },
});
