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
      description: 'Suggest using toStrictEqual()',
      recommended: false,
    },
    messages: {
      useToStrictEqual: 'Use `toStrictEqual()` instead',
      suggestReplaceWithStrictEqual: 'Replace with `toStrictEqual()`',
    },
    fixable: 'code',
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isExpectCall(node)) {
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
