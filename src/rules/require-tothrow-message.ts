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
      requireRethrow: 'Add an error message to {{ propertyName }}()',
    },
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

        const { matcher, modifier } = parseExpectCall(node);

        if (
          matcher &&
          matcher.arguments &&
          matcher.arguments.length === 0 &&
          ['toThrow', 'toThrowError'].includes(matcher.name) &&
          (!modifier ||
            !(modifier.name === ModifierName.not || modifier.negation))
        ) {
          // Look for `toThrow` calls with no arguments.
          context.report({
            messageId: 'requireRethrow', // todo: rename to 'addErrorMessage'
            data: { propertyName: matcher.name }, // todo: rename to 'matcherName'
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
