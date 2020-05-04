import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { createRule, isExpectCall, parseExpectCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow string interpolation inside inline snapshots.',
      recommended: false,
    },
    messages: {
      noInterpolation:
        'Do not use string interpolation inside of inline snapshots',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isExpectCall(node)) {
          return;
        }

        const { matcher } = parseExpectCall(node);

        if (
          matcher?.name !== 'toMatchInlineSnapshot' ||
          matcher?.arguments === null
        ) {
          return;
        }

        // Check all since the optional 'propertyMatchers' argument might be present
        matcher.arguments.forEach(argument => {
          if (
            argument.type === AST_NODE_TYPES.TemplateLiteral &&
            argument.expressions.length > 0
          ) {
            context.report({
              messageId: 'noInterpolation',
              node: argument,
            });
          }
        });
      },
    };
  },
});
