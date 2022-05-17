import {
  EqualityMatcher,
  createRule,
  isExpectCall,
  isParsedEqualityMatcherCall,
  parseExpectCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toStrictEqual()`',
      recommended: false,
      suggestion: true,
    },
    messages: {
      useToStrictEqual: 'Use `toStrictEqual()` instead',
      suggestReplaceWithStrictEqual: 'Replace with `toStrictEqual()`',
    },
    type: 'suggestion',
    schema: [],
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isExpectCall(node, context.getScope())) {
          return;
        }

        const { matcher } = parseExpectCall(node);

        if (
          matcher &&
          isParsedEqualityMatcherCall(matcher, EqualityMatcher.toEqual)
        ) {
          context.report({
            messageId: 'useToStrictEqual',
            node: matcher.node.property,
            suggest: [
              {
                messageId: 'suggestReplaceWithStrictEqual',
                fix: fixer => [
                  fixer.replaceText(
                    matcher.node.property,
                    EqualityMatcher.toStrictEqual,
                  ),
                ],
              },
            ],
          });
        }
      },
    };
  },
});
