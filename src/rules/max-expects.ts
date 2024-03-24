import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  type FunctionExpression,
  createRule,
  isTypeOfJestFnCall,
  parseJestFnCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      description: 'Enforces a maximum number assertion calls in a test body',
    },
    messages: {
      exceededMaxAssertion:
        'Too many assertion calls ({{ count }}) - maximum allowed is {{ max }}',
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

    const maybeResetCount = (node: FunctionExpression) => {
      const isTestFn =
        node.parent?.type !== AST_NODE_TYPES.CallExpression ||
        isTypeOfJestFnCall(node.parent, context, ['test']);

      if (isTestFn) {
        count = 0;
      }
    };

    return {
      FunctionExpression: maybeResetCount,
      'FunctionExpression:exit': maybeResetCount,
      ArrowFunctionExpression: maybeResetCount,
      'ArrowFunctionExpression:exit': maybeResetCount,
      CallExpression(node) {
        const jestFnCall = parseJestFnCall(node, context);

        if (
          jestFnCall?.type !== 'expect' ||
          jestFnCall.head.node.parent?.type === AST_NODE_TYPES.MemberExpression
        ) {
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
