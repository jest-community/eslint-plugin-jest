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
      description:
        'Suggest using `toBeCalledWith()` or `toHaveBeenCalledWith()`',
      recommended: false,
    },
    messages: {
      preferCalledWith: 'Prefer {{name}}With(/* expected args */)',
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

        const { modifier, matcher } = parseExpectCall(node);

        if (
          !matcher ||
          modifier?.name === ModifierName.not ||
          modifier?.negation
        ) {
          return;
        }

        if (['toBeCalled', 'toHaveBeenCalled'].includes(matcher.name)) {
          context.report({
            data: { name: matcher.name },
            messageId: 'preferCalledWith',
            node: matcher.node.property,
          });
        }
      },
    };
  },
});
