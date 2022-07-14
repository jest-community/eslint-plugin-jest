import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  FunctionExpression,
  createRule,
  isExpectCall,
  isTypeOfJestFnCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforces a maximum number assertion calls in a test body',
      recommended: false,
    },
    messages: {
      exceededMaxAssertion:
        'Too many assertion calls ({{ count }}). Maximum allowed is {{ max }}.',
    },
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ max: 5 }],
  create(context, [{ max }]) {
    let count = 0;

    const onFunctionExpressionEnter = (node: FunctionExpression) => {
      const isTestFn =
        node.parent?.type !== AST_NODE_TYPES.CallExpression ||
        isTypeOfJestFnCall(node.parent, context, ['test']);

      if (isTestFn) {
        count = 0;

        return;
      }
    };

    return {
      FunctionExpression: onFunctionExpressionEnter,
      ArrowFunctionExpression: onFunctionExpressionEnter,
      CallExpression(node) {
        if (!isExpectCall(node)) {
          return;
        }

        count += 1;

        if (count > max) {
          context.report({
            node,
            messageId: 'exceededMaxAssertion',
            data: { count, max },
          });
        }
      },
    };
  },
});
