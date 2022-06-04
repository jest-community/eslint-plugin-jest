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
      restrictedChain: 'Use of `{{ chain }}` is disallowed',
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

        const permutations = [jestFnCall.members];

        if (jestFnCall.members.length > 2) {
          permutations.push([jestFnCall.members[0], jestFnCall.members[1]]);
          permutations.push([jestFnCall.members[1], jestFnCall.members[2]]);
        }

        if (jestFnCall.members.length > 1) {
          permutations.push(...jestFnCall.members.map(nod => [nod]));
        }

        for (const permutation of permutations) {
          const chain = permutation.map(nod => getAccessorValue(nod)).join('.');

          if (chain in restrictedChains) {
            const message = restrictedChains[chain];

            context.report({
              messageId: message
                ? 'restrictedChainWithMessage'
                : 'restrictedChain',
              data: { message, chain },
              loc: {
                start: permutation[0].loc.start,
                end: permutation[permutation.length - 1].loc.end,
              },
            });

            break;
          }
        }
      },
    };
  },
});
