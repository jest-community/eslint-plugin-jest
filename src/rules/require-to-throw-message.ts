import {
  ModifierName,
  createRule,
  isExpectCall,
  parseExpectCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Require a message for `toThrow()`',
      recommended: false,
    },
    messages: {
      addErrorMessage: 'Add an error message to {{ matcherName }}()',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isExpectCall(node, context.getScope())) {
          return;
        }

        const { matcher, modifier } = parseExpectCall(node);

        if (
          matcher?.arguments?.length === 0 &&
          ['toThrow', 'toThrowError'].includes(matcher.name) &&
          (!modifier ||
            !(modifier.name === ModifierName.not || modifier.negation))
        ) {
          // Look for `toThrow` calls with no arguments.
          context.report({
            messageId: 'addErrorMessage',
            data: { matcherName: matcher.name },
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
