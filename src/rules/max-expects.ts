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
      description: 'Enforces a maximum assertion calls in a test body',
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
            minimum: 0,
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
      if (!node?.parent) {
        return;
      }

      const isTestFn =
        node.parent.type !== AST_NODE_TYPES.CallExpression ||
        isTypeOfJestFnCall(node.parent, context, ['test']);

      if (isTestFn) {
        count = 0;

        return;
      }
    };
    const onFunctionExpressionExit = (node: FunctionExpression) => {
      if (!node?.parent) {
        return;
      }

      const isTestFn =
        node.parent.type !== AST_NODE_TYPES.CallExpression ||
        isTypeOfJestFnCall(node.parent, context, ['test']);

      if (isTestFn) {
        count = count - 1;

        return;
      }
    };

    return {
      FunctionExpression: onFunctionExpressionEnter,
      'FunctionExpression:exit': onFunctionExpressionExit,
      ArrowFunctionExpression: onFunctionExpressionEnter,
      'ArrowFunctionExpression:exit': onFunctionExpressionExit,
      CallExpression(node) {
        if (isExpectCall(node)) {
          count += 1;
        }
        if (count > max && node.parent) {
          context.report({
            node: node.parent,
            messageId: 'exceededMaxAssertion',
            data: { count, max },
          });
        }
      },
    };
  },
});
