import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule, getAccessorValue, parseJestFnCall_1 } from './utils';

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

        const parsed = parseJestFnCall_1(node, scope);

        if (parsed?.type !== 'test' && parsed?.type !== 'describe') {
          return;
        }

        if ((parsed.head.original ?? parsed.head.local).startsWith('f')) {
          context.report({
            messageId: 'focusedTest',
            node,
            suggest: [
              {
                messageId: 'suggestRemoveFocus',
                fix(fixer) {
                  // if(parsed.name !== parsed.)
                  // return [];
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
