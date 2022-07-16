import { createRule, getAccessorValue, parseJestFnCall } from './utils';

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
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'expect') {
          return;
        }

        const matcher = jestFnCall.members[jestFnCall.members.length - 1];

        if (
          matcher &&
          jestFnCall.args.length === 0 &&
          ['toThrow', 'toThrowError'].includes(getAccessorValue(matcher)) &&
          !jestFnCall.members.some(nod => getAccessorValue(nod) === 'not')
        ) {
          // Look for `toThrow` calls with no arguments.
          context.report({
            messageId: 'addErrorMessage',
            data: { matcherName: getAccessorValue(matcher) },
            node: matcher,
          });
        }
      },
    };
  },
});
