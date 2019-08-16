import { createRule, isExpectCall, parseExpectCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Suggest using `toBeCalledWith()` OR `toHaveBeenCalledWith()`',
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

        // Could check resolves/rejects here but not a likely idiom.
        if (matcher && !modifier) {
          if (['toBeCalled', 'toHaveBeenCalled'].includes(matcher.name)) {
            context.report({
              data: { name: matcher.name }, // todo: rename to 'matcherName'
              messageId: 'preferCalledWith',
              node: matcher.node.property,
            });
          }
        }
      },
    };
  },
});
