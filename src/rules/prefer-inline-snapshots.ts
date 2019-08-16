import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import { createRule } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using inline snapshots',
      recommended: false,
    },
    messages: {
      toMatch: 'Use toMatchInlineSnapshot() instead',
      toMatchError: 'Use toThrowErrorMatchingInlineSnapshot() instead',
    },
    fixable: 'code',
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;

        if (
          callee.type !== AST_NODE_TYPES.MemberExpression ||
          callee.property.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        if (callee.property.name === 'toMatchSnapshot') {
          context.report({
            fix(fixer) {
              return [
                fixer.replaceText(callee.property, 'toMatchInlineSnapshot'),
              ];
            },
            messageId: 'toMatch',
            node: callee.property,
          });
        } else if (callee.property.name === 'toThrowErrorMatchingSnapshot') {
          context.report({
            fix(fixer) {
              return [
                fixer.replaceText(
                  callee.property,
                  'toThrowErrorMatchingInlineSnapshot',
                ),
              ];
            },
            messageId: 'toMatchError',
            node: callee.property,
          });
        }
      },
    };
  },
});
