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
    deprecated: true,
    replacedBy: ['no-restricted-matchers'],
    messages: {
      avoidMatcher: 'Avoid {{ matcherName }}',
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
          messageId: 'avoidMatcher',
          node: matcher.node.property,
          data: { matcherName: matcher.name },
        });
      },
    };
  },
});
