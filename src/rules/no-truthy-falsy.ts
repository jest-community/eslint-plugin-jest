import { createRule, isExpectCall, parseExpectCall } from './utils';

// todo: refactor into "ban-matchers"
export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow using `toBeTruthy()` & `toBeFalsy()`',
      recommended: false,
    },
    messages: {
      avoidMessage: 'Avoid {{ methodName }}',
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

        const { matcher } = parseExpectCall(node);
        if (!matcher || !['toBeTruthy', 'toBeFalsy'].includes(matcher.name)) {
          return;
        }

        context.report({
          data: { methodName: matcher.name }, // todo: rename to 'matcherName'
          messageId: 'avoidMessage', // todo: rename to 'avoidMatcher'
          node: matcher.node.property,
        });
      },
    };
  },
});
