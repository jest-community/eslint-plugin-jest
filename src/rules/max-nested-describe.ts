import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createRule, isDescribeCall } from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforces a maximum depth to nested describe calls',
      recommended: false,
    },
    messages: {
      exceededMaxDepth:
        'Too many nested describe calls ({{ depth }}). Maximum allowed is {{ max }}.',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 0,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ max: 5 }],
  create(context, [{ max }]) {
    const scope = context.getScope();
    const describeCallbackStack: number[] = [];

    function pushDescribeCallback(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ) {
      const { parent } = node;

      if (
        parent?.type !== AST_NODE_TYPES.CallExpression ||
        !isDescribeCall(parent, scope)
      ) {
        return;
      }

      describeCallbackStack.push(0);

      if (describeCallbackStack.length > max) {
        context.report({
          node: parent,
          messageId: 'exceededMaxDepth',
          data: { depth: describeCallbackStack.length, max },
        });
      }
    }

    function popDescribeCallback(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ) {
      const { parent } = node;

      if (
        parent?.type === AST_NODE_TYPES.CallExpression &&
        isDescribeCall(parent, scope)
      ) {
        describeCallbackStack.pop();
      }
    }

    return {
      FunctionExpression: pushDescribeCallback,
      'FunctionExpression:exit': popDescribeCallback,
      ArrowFunctionExpression: pushDescribeCallback,
      'ArrowFunctionExpression:exit': popDescribeCallback,
    };
  },
});
