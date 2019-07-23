import {
  createRule,
  isExpectCallWithNot,
  isExpectCallWithParent,
} from './tsUtils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toBeCalledWith` OR `toHaveBeenCalledWith`',
      recommended: false,
    },
    messages: {
      preferCalledWith: 'Prefer {{ name }}With(/* expected args */)',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        // Could check resolves/rejects here but not a likely idiom.
        if (isExpectCallWithParent(node) && !isExpectCallWithNot(node)) {
          const methodNode = node.parent.property;
          const { name } = methodNode;
          if (name === 'toBeCalled' || name === 'toHaveBeenCalled') {
            context.report({
              data: { name },
              messageId: 'preferCalledWith',
              node: methodNode,
            });
          }
        }
      },
    };
  },
});
