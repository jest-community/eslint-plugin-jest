import { TSESTree } from '@typescript-eslint/utils';
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
    const reportIfRestricted = (
      loc: TSESTree.SourceLocation,
      chain: string,
    ): boolean => {
      if (!(chain in restrictedChains)) {
        return false;
      }

      const message = restrictedChains[chain];

      context.report({
        messageId: message ? 'restrictedChainWithMessage' : 'restrictedChain',
        data: { message, chain },
        loc,
      });

      return true;
    };

    return {
      CallExpression(node) {
        if (!isExpectCall(node)) {
          return;
        }

        const { matcher, modifier } = parseExpectCall(node);

        if (
          matcher &&
          reportIfRestricted(matcher.node.property.loc, matcher.name)
        ) {
          return;
        }

        if (modifier) {
          if (reportIfRestricted(modifier.node.property.loc, modifier.name)) {
            return;
          }

          if (modifier.negation) {
            if (
              reportIfRestricted(modifier.negation.property.loc, 'not') ||
              reportIfRestricted(
                {
                  start: modifier.node.property.loc.start,
                  end: modifier.negation.property.loc.end,
                },
                `${modifier.name}.not`,
              )
            ) {
              return;
            }
          }
        }

        if (matcher && modifier) {
          let chain: string = modifier.name;

          if (modifier.negation) {
            chain += '.not';
          }

          chain += `.${matcher.name}`;

          reportIfRestricted(
            {
              start: modifier.node.property.loc.start,
              end: matcher.node.property.loc.end,
            },
            chain,
          );
        }
      },
    };
  },
});
