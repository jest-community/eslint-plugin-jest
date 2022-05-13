import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  AccessorNode,
  JestFunctionCallExpression,
  createRule,
  getNodeName,
  isDescribeCall,
  isSupportedAccessor,
  isTestCaseCall,
} from './utils';

const findOnlyNode = (
  node: JestFunctionCallExpression,
): AccessorNode<'only'> | null => {
  const callee =
    node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression
      ? node.callee.tag
      : node.callee.type === AST_NODE_TYPES.CallExpression
      ? node.callee.callee
      : node.callee;

  if (callee.type === AST_NODE_TYPES.MemberExpression) {
    if (callee.object.type === AST_NODE_TYPES.MemberExpression) {
      if (isSupportedAccessor(callee.object.property, 'only')) {
        return callee.object.property;
      }
    }

    if (isSupportedAccessor(callee.property, 'only')) {
      return callee.property;
    }
  }

  return null;
};

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
    const scope = context.getScope();

    return {
      CallExpression(node) {
        if (!isDescribeCall(node, scope) && !isTestCaseCall(node, scope)) {
          return;
        }

        if (getNodeName(node).startsWith('f')) {
          context.report({
            messageId: 'focusedTest',
            node,
            suggest: [
              {
                messageId: 'suggestRemoveFocus',
                fix: fixer =>
                  fixer.removeRange([node.range[0], node.range[0] + 1]),
              },
            ],
          });

          return;
        }

        const onlyNode = findOnlyNode(node);

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
