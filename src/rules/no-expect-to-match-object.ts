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
      description: 'Disallow expect.toMatchObject',
      recommended: false,
    },
    messages: {
      useToStrictEqualOrObjectContaining:
        'Use toStrictEqual() for a deep equality check or objectContaining() to check specific properties',
    },
    schema: [],
    type: 'suggestion',
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
          isParsedEqualityMatcherCall(matcher, EqualityMatcher.toMatchObject)
        ) {
          context.report({
            messageId: 'useToStrictEqualOrObjectContaining',
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
