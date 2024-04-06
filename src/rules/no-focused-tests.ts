import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule, getAccessorValue, parseJestFnCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Disallow focused tests',
    },
    messages: {
      focusedTest: 'Unexpected focused test',
      suggestRemoveFocus: 'Remove focus from test',
    },
    schema: [],
    type: 'suggestion',
    hasSuggestions: true,
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (jestFnCall?.type !== 'test' && jestFnCall?.type !== 'describe') {
          return;
        }

        if (jestFnCall.name.startsWith('f')) {
          context.report({
            messageId: 'focusedTest',
            node: jestFnCall.head.node,
            suggest: [
              {
                messageId: 'suggestRemoveFocus',
                fix(fixer) {
                  // don't apply the fixer if we're an aliased import
                  if (
                    jestFnCall.head.type === 'import' &&
                    jestFnCall.name !== jestFnCall.head.local
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

        const onlyNode = jestFnCall.members.find(
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
