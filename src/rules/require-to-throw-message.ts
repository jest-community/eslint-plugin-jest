import { createRule, getAccessorValue, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Require a message for `toThrow()`',
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
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const { matcher } = jestFnCall;
        const matcherName = getAccessorValue(matcher);

        if (
          jestFnCall.args.length === 0 &&
          ['toThrow', 'toThrowError'].includes(matcherName) &&
          !jestFnCall.modifiers.some(nod => getAccessorValue(nod) === 'not')
        ) {
          // Look for `toThrow` calls with no arguments.
          context.report({
            messageId: 'addErrorMessage',
            data: { matcherName },
            node: matcher,
          });
        }
      },
    };
  },
});
