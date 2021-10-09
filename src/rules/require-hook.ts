import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import {
  createRule,
  isDescribeCall,
  isFunction,
  isHook,
  isTestCaseCall,
} from './utils';

export default createRule({
  name: __filename,
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Require setup and teardown code to be within a hook',
      recommended: false,
    },
    messages: {
      useHook: 'This should be done within a hook',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isDescribeCall(node) || node.arguments.length < 2) {
          return;
        }

        const [, testFn] = node.arguments;

        if (
          !isFunction(testFn) ||
          testFn.body.type !== AST_NODE_TYPES.BlockStatement
        ) {
          return;
        }

        for (const nod of testFn.body.body) {
          if (
            nod.type === AST_NODE_TYPES.ExpressionStatement &&
            nod.expression.type === AST_NODE_TYPES.CallExpression
          ) {
            if (
              isDescribeCall(nod.expression) ||
              isTestCaseCall(nod.expression) ||
              isHook(nod.expression)
            ) {
              return;
            }

            context.report({
              node: nod.expression,
              messageId: 'useHook',
            });
          }
        }
      },
    };
  },
});
