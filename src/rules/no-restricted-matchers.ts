import {
  ModifierName,
  createRule,
  getAccessorValue,
  parseJestFnCall,
} from './utils';

const isChainRestricted = (chain: string, restriction: string): boolean => {
  if (
    ModifierName.hasOwnProperty(restriction) ||
    restriction.endsWith('.not')
  ) {
    return chain.startsWith(restriction);
  }

  return chain === restriction;
};

export default createRule<
  [Record<string, string | null>],
  'restrictedChain' | 'restrictedChainWithMessage'
>({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow specific matchers & modifiers',
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
          if (isChainRestricted(chain, restriction)) {
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
