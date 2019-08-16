import { createRule, isExpectCall, parseExpectCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using toStrictEqual()',
      recommended: false,
    },
    messages: {
      useToStrictEqual: 'Use toStrictEqual() instead',
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

        if (matcher && matcher.name === 'toEqual') {
          context.report({
            fix: fixer => [
              fixer.replaceText(matcher.node.property, 'toStrictEqual'),
            ],
            messageId: 'useToStrictEqual',
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
