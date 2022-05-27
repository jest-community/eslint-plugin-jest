import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow focused tests',
      recommended: 'error',
      suggestion: true,
    },
    messages: {
      focusedTest: 'Unexpected focused test.',
      suggestRemoveFocus: 'Remove focus from test.',
    },
    schema: [],
    type: 'suggestion',
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const scope = context.getScope();

        const parsed = parseJestFnCall(node, scope);

        if (parsed?.type !== 'test' && parsed?.type !== 'describe') {
          return;
        }

        if (parsed.name.startsWith('f')) {
          context.report({
            messageId: 'focusedTest',
            node,
            suggest: [
              {
                messageId: 'suggestRemoveFocus',
                fix(fixer) {
                  // don't apply the fixer if we're an aliased import
                  if (
                    parsed.head.type === 'import' &&
                    parsed.name !== parsed.head.local
                  ) {
                    return null;
                  }

                  return fixer.removeRange([node.range[0], node.range[0] + 1]);
                },
              },
            ],
          });

          return;
        }

        const onlyNode = parsed.members.find(
          s => getAccessorValue(s) === 'only',
        );

        if (!onlyNode) {
          return;
        }

        context.report({
          messageId: 'focusedTest',
          node: onlyNode,
          suggest: [
            {
              messageId: 'suggestRemoveFocus',
              fix: fixer =>
                fixer.removeRange([
                  onlyNode.range[0] - 1,
                  onlyNode.range[1] +
                    Number(onlyNode.type !== AST_NODE_TYPES.Identifier),
                ]),
            },
          ],
        });
      },
    };
  },
});
