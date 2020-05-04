import { createRule, isExpectCall, parseExpectCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow expect.toMatchObject',
      recommended: false,
    },
    messages: {
      useToStrictEqual: 'Use toStrictEqual() for a deep equality check',
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

        if (matcher?.name === 'toMatchObject') {
          context.report({
            messageId: 'useToStrictEqual',
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
