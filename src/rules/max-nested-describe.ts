import { TSESTree } from '@typescript-eslint/experimental-utils';
import { createRule, isCallExpression, isDescribeCall } from './utils';

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
        'Too many nested describe calls ({{depth}}). Maximum allowed is {{max}}.',
    },
    type: 'suggestion',
    schema: [
      {
        oneOf: [
          {
            type: 'integer',
            minimum: 0,
          },
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
    ],
  },
  defaultOptions: [{ max: 2 }],
  create(context, [{ max }]) {
    const describeCallbackStack: number[] = [];

    function pushDescribeCallback(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ) {
      const { parent } = node;

      if (!isCallExpression(parent) || !isDescribeCall(parent)) {
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

      if (isCallExpression(parent) && isDescribeCall(parent)) {
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
