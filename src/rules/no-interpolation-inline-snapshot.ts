import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

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
        const { callee, arguments: nodeArguments } = node;

        if (
          callee.type !== AST_NODE_TYPES.MemberExpression ||
          callee.property.type !== AST_NODE_TYPES.Identifier ||
          callee.property.name !== 'toMatchInlineSnapshot'
        ) {
          return;
        }

        // Check all since the optional 'propertyMatchers' argument might be present
        nodeArguments.forEach(argument => {
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
