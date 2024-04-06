import { createRule, getAccessorValue, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description:
        'Suggest using `toBeCalledWith()` or `toHaveBeenCalledWith()`',
    },
    messages: {
      preferCalledWith: 'Prefer {{ matcherName }}With(/* expected args */)',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        if (jestFnCall.modifiers.some(nod => getAccessorValue(nod) === 'not')) {
          return;
        }

        const { matcher } = jestFnCall;
        const matcherName = getAccessorValue(matcher);

        if (['toBeCalled', 'toHaveBeenCalled'].includes(matcherName)) {
          context.report({
            data: { matcherName },
            messageId: 'preferCalledWith',
            node: matcher,
          });
        }
      },
    };
  },
});
