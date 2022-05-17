import { createRule, isExpectCall, parseExpectCall } from './utils';

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
        if (!isExpectCall(node, context.getScope())) {
          return;
        }

        const { matcher, modifier } = parseExpectCall(node);

        if (matcher) {
          const chain = matcher.name;

          if (chain in restrictedChains) {
            const message = restrictedChains[chain];

            context.report({
              messageId: message
                ? 'restrictedChainWithMessage'
                : 'restrictedChain',
              data: { message, chain },
              node: matcher.node.property,
            });

            return;
          }
        }

        if (modifier) {
          const chain = modifier.name;

          if (chain in restrictedChains) {
            const message = restrictedChains[chain];

            context.report({
              messageId: message
                ? 'restrictedChainWithMessage'
                : 'restrictedChain',
              data: { message, chain },
              node: modifier.node.property,
            });

            return;
          }
        }

        if (matcher && modifier) {
          const chain = `${modifier.name}.${matcher.name}`;

          if (chain in restrictedChains) {
            const message = restrictedChains[chain];

            context.report({
              messageId: message
                ? 'restrictedChainWithMessage'
                : 'restrictedChain',
              data: { message, chain },
              loc: {
                start: modifier.node.property.loc.start,
                end: matcher.node.property.loc.end,
              },
            });

            return;
          }
        }
      },
    };
  },
});
